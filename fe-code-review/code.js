//Its way too long, we should split it in pure functions
app.post('/api/extract', upload.single('file'), async (req, res) => {
    //Code formatting is inconsistent, maybe forgot about prettier?
    logInfo('POST /api/extract',req.body);
    //do we want to log whole file?
    logInfo('FILE=',req.file);

    //we start a long nested if, maybe turn the if statement around and return?
    if (req.body) {
        const file = req.file;
        const requestID = req.body.requestID;
        const project = req.body.project;
        const idUser = req.body.userID;
        const user = await User.findOne(idUser);

        if (requestID && project && idUser && user) {
            logDebug('User with role '+user.role, user);
            //Does it mean that role can have ADVISOR in it or role can be an array as indexOf exist on both and might have unexpected results?
            //String should go into constant
            if (user.role === 'ADVISOR' || user.role.indexOf('ADVISOR') > -1)
                return res.json({requestID, step: 999, status: 'DONE', message: 'Nothing to do for ADVISOR role'});

            /* reset status variables */
            await db.updateStatus(requestID, 1, '');

            logDebug('CONFIG:', config.projects);
            //Project string to constant, missing check if config.projects exist - may cause an error. We are nesting ifs even more, maybe return first if not this project? And move to seperate function
            if (project === 'inkasso' && config.projects.hasOwnProperty(project) && file) {
                //Unused variable
                const hashSum = crypto.createHash('sha256');
                const fileHash = idUser;
                //Probably should be a constant on top of file
                const fileName = 'fullmakt';
                const fileType = mime.getExtension(file.mimetype);
                if (fileType !== 'pdf')
                    return res.status(500).json({requestID, message: 'Missing pdf file'});
                //Why we jump to 3 from 1?
                await db.updateStatus(requestID, 3, '');

                const folder = `${project}-signed/${idUser}`;
                //It is the same log as the one before but in debug not info, and why is it called FILE2?
                logDebug('FILE2=', file);
                //What if it will fail to upload??
                await uploadToGCSExact(folder, fileHash, fileName, fileType, file.mimetype, file.buffer);
                //We update status update quite often, maybe we should move it to seperate class and use some increment method instead? 
                await db.updateStatus(requestID, 4, '');
                //What if it will fail to upload?
                const ret = await db.updateUploadedDocs(idUser, requestID, fileName, fileType, file.buffer);
                logDebug('DB UPLOAD:', ret);

                await db.updateStatus(requestID, 5, '');

                //Unused variable
                let sent = true;
                //this seems like completly not related logic to what was happening before, maybe it should be seperated?
                const debtCollectors = await db.getDebtCollectors();
                logDebug('debtCollectors=', debtCollectors);
                if (!debtCollectors)
                    return res.status(500).json({requestID, message: 'Failed to get debt collectors'});

                //is !! necessary? hasUserRequest suggest it returns boolean. There is FIX comment, shouldnt that be fixed before merging? 
                if (!!(await db.hasUserRequestKey(idUser))) { //FIX: check age, not only if there's a request or not
                    return res.json({requestID, step: 999, status: 'DONE', message: 'Emails already sent'});
                }

                const sentStatus = {};
                //Code formatting is inconsistent
                for (let i = 0; i < debtCollectors.length ; i++) {
                    //why do we start from 10 + i? Maybe 10 should be moved into constant with descriptive name
                    //Later we updateStatus to 100, what if debtCollectors length is longer? How should it behave?
                    await db.updateStatus(requestID, 10+i, '');
                    const idCollector = debtCollectors[i].id;
                    const collectorName = debtCollectors[i].name;
                    const collectorEmail = debtCollectors[i].email;
                    //We declared hashSum before that is not used and here we create hash on every iteration, which one we want to use?
                    const hashSum = crypto.createHash('sha256');
                    const hashInput = `${idUser}-${idCollector}-${(new Date()).toISOString()}`;
                    logDebug('hashInput=', hashInput);
                    hashSum.update(hashInput);
                    const requestKey = hashSum.digest('hex');
                    logDebug('REQUEST KEY:', requestKey);

                    const hash = Buffer.from(`${idUser}__${idCollector}`, 'utf8').toString('base64')

                    if (!!(await db.setUserRequestKey(requestKey, idUser))
                        && !!(await db.setUserCollectorRequestKey(requestKey, idUser, idCollector))) {

                        /* prepare email */
                        const sendConfig = {
                            //Are we sure that it exist? It can fail in runtime
                            sender: config.projects[project].email.sender,
                            replyTo: config.projects[project].email.replyTo,
                            //Missing '
                            subject: 'Email subject,
                            templateId: config.projects[project].email.template.collector,
                            params: {
                                downloadUrl: `https://url.go/download?requestKey=${requestKey}&hash=${hash}`,
                                uploadUrl: `https://url.go/upload?requestKey=${requestKey}&hash=${hash}`,
                                confirmUrl: `https://url.go/confirm?requestKey=${requestKey}&hash=${hash}`
                            },
                            tags: ['request'],
                            to: [{ email: collectorEmail , name: collectorName }],
                        };
                        logDebug('Send config:', sendConfig);

                        try {
                            await db.setEmailLog({collectorEmail, idCollector, idUser, requestKey})
                        } catch (e) {
                            //should it be logDebug or logError?
                            logDebug('extract() setEmailLog error=', e);
                        }

                        /* send email */
                        const resp = await email.send(sendConfig, config.projects[project].email.apiKey);
                        logDebug('extract() resp=', resp);

                        // update DB with result
                        await db.setUserCollectorRequestKeyRes(requestKey, idUser, idCollector, resp);

                        if (!sentStatus[collectorName])
                            sentStatus[collectorName] = {};
                        sentStatus[collectorName][collectorEmail] = resp;

                        //Shouldnt it be after we get response? We probably dont want to run db.setUserCollectorRequestKeyRes if response failed
                        if (!resp) {
                            //We will log both in logDebug and logError - maybe structure should look a bit different?
                            logError('extract() Sending email failed: ', resp);
                        }
                    }
                }
                //Why update to 100?
                await db.updateStatus(requestID, 100, '');

                logDebug('FINAL SENT STATUS:');
                console.dir(sentStatus, {depth: null});

                //Why is it commented? If its not necessary it should be deleted
                //if (!allSent)
                //return res.status(500).json({requestID, message: 'Failed sending email'});

                //We dont do anything and update to 500?
                await db.updateStatus(requestID, 500, '');

                //We make summary email configuration, but we dont sent email? We should sent email or remove it.
                //We also create email config 2nd time, maybe it should get seperated to function?
                /* prepare summary email */
                const summaryConfig = {
                    //Why is it commented? If its not necessary it should be deleted
                    //bcc: [{ email: 'tomas@inkassoregisteret.com', name: 'Tomas' }],
                    sender: config.projects[project].email.sender,
                    replyTo: config.projects[project].email.replyTo,
                    subject: 'Oppsummering Kravsforespørsel',
                    templateId: config.projects[project].email.template.summary,
                    params: {
                        collectors: sentStatus,
                    },
                    tags: ['summary'],
                    //Shouldnt that be fixed?
                    to: [{ email: 'tomas@upscore.no' , name: 'Tomas' }], // FIXXX: config.projects[project].email.sender
                };
                logDebug('Summary config:', summaryConfig);

                //Why is it commented? If its not necessary it should be deleted
                /* send email */
                //const respSummary = await email.send(sendConfig, config.projects[project].email.apiKey);
                //logDebug('extract() summary resp=', respSummary);

                //We dont do anything and update status again, is it necessary?
                await db.updateStatus(requestID, 900, '');
            }
            await db.updateStatus(requestID, 999, '');
            return res.json({requestID, step: 999, status: 'DONE', message: 'Done sending emails...'});
        } else
            return res.status(500).json({requestID, message: 'Missing requried input (requestID, project, file)'});
    }
    res.status(500).json({requestID: '', message: 'Missing requried input (form data)'});
});