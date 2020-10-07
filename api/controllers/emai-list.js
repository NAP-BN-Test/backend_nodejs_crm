const Result = require('../constants/result');
const Constant = require('../constants/constant');

const Op = require('sequelize').Op;

var moment = require('moment');

var database = require('../db');

var mMailList = require('../tables/mail-list');
var mMailListDetail = require('../tables/mail-list-detail');

var mMailCampain = require('../tables/mail-campain');
var mMailResponse = require('../tables/mail-response');

var mAmazon = require('../controllers/amazon');
var mCheckMail = require('../controllers/check-mail');
var cUser = require('../controllers/user');

var mUser = require('../tables/user');

var mModules = require('../constants/modules');
const { MAIL_RESPONSE_TYPE } = require('../constants/constant');

function handleClickLink(body, mailListDetailID) {
    var bodyHtml = "";

    var listLink = body.body.split('<a');

    if (listLink.length > 0) {
        let tokenClickLink = `ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&idMailCampain=${body.campainID}&idMailListDetail=${mailListDetailID}`;
        let tokenClickLinkEncrypt = mModules.encryptKey(tokenClickLink);

        bodyHtml = listLink[0];

        for (let i = 0; i < listLink.length; i++) {
            if (i > 0) {
                var content = "<a" + listLink[i].slice(0, 6) + `clicklink.namanphu.tech?token=${tokenClickLinkEncrypt}&url=` + listLink[i].slice(6);
                bodyHtml = bodyHtml + content;
            }
        }

        return bodyHtml;
    } else return body.body;
}


module.exports = {

    getMailList: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);

                var mailList = mMailList(db);
                mailList.belongsTo(mUser(db), { foreignKey: 'OwnerID' })
                mailList.hasMany(mMailListDetail(db), { foreignKey: 'MailListID' })

                var mMailListData = await mailList.findAll({
                    where: where,
                    include: [
                        { model: mUser(db) },
                        { model: mMailListDetail(db) }
                    ],
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                })

                var array = [];
                mMailListData.forEach(item => {
                    array.push({
                        id: Number(item.ID),
                        name: item.Name,
                        owner: item.User.Name,
                        createTime: mModules.toDatetime(item.TimeCreate),
                        contactCount: item.MailListDetails.length
                    })
                })

                var mMailListCount = await mailList.count();
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    count: mMailListCount
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    getMailListDetail: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var mailListDetail = mMailListDetail(db);
                mailListDetail.belongsTo(mUser(db), { foreignKey: 'OwnerID' });
                mailListDetail.hasMany(mMailResponse(db), { foreignKey: 'MailListDetailID' });

                var mMailListDetailData = await mailListDetail.findAll({
                    where: { MailListID: body.mailListID },
                    include: [
                        { model: mUser(db) },
                        {
                            model: mMailResponse(db),
                            required: false,
                            where: { Type: Constant.MAIL_RESPONSE_TYPE.SEND }
                        }
                    ],
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                })

                var mMailListDetailCount = await mailListDetail.count({
                    where: { MailListID: body.mailListID }
                })
                var array = [];

                mMailListDetailData.forEach(item => {
                    array.push({
                        id: Number(item.ID),
                        email: item.Email,
                        owner: item.User.Name,
                        createTime: mModules.toDatetime(item.TimeCreate),
                        mailCount: item.MailResponses.length,
                        contactName: item.Name
                    })
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    count: mMailListDetailCount
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    getListMailCampain: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);

                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mUser(db), { foreignKey: 'OwnerID' });

                var mailCampainData = await mailCampain.findAll({
                    where: where,
                    include: { model: mUser(db) },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                });

                var mailCampainCount = await mailCampain.count();

                var array = [];
                mailCampainData.forEach(item => {
                    array.push({
                        id: Number(item.ID),
                        name: item.Name,
                        subject: item.Subject,
                        owner: item.User.Name,
                        createTime: mModules.toDatetime(item.TimeCreate),
                        nearestSend: '2020-05-30 14:00'
                    })
                })

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    count: mailCampainCount
                }
                res.json(result);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    getMailCampainDetail: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mUser(db), { foreignKey: 'OwnerID' });
                mailCampain.belongsTo(mMailList(db), { foreignKey: 'MailListID' });

                var mailCampainData = await mailCampain.findOne({
                    where: { ID: body.campainID },
                    include: [
                        { model: mUser(db) },
                        { model: mMailList(db) }
                    ]
                });

                var obj = {
                    id: Number(mailCampainData.ID),
                    name: mailCampainData.Name,
                    subject: mailCampainData.Subject,
                    owner: mailCampainData.User.Name,
                    createTime: mModules.toDatetime(mailCampainData.TimeCreate),
                    endTime: mailCampainData.TimeEnd,
                    body: mailCampainData.Body,
                    mailListID: Number(mailCampainData.MailListID),
                    mailListName: mailCampainData.MailList.Name ? mailCampainData.MailList.Name : ""
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj
                }
                res.json(result);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    addMailList: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                var mailList = await mMailList(db).create({
                    Name: body.name,
                    OwnerID: Number(body.userID),
                    TimeCreate: now,
                })

                if (body.listMail) {
                    let arrMail = JSON.parse(body.listMail);

                    let bulkCreate = [];
                    arrMail.forEach(mailItem => {
                        bulkCreate.push({
                            Email: mailItem,
                            OwnerID: body.userID,
                            TimeCreate: now,
                            MailListID: mailList.ID
                        })
                    })

                    await mMailListDetail(db).bulkCreate(bulkCreate);
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                }
                res.json(result);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    deleteMailList: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                if (body.listID) {
                    let listID = JSON.parse(body.listID);

                    await mMailListDetail(db).destroy({
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    });
                    await mMailCampain(db).update({ MailListID: null }, {
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    });
                    await mMailList(db).destroy({
                        where: {
                            ID: {
                                [Op.in]: listID
                            }
                        }
                    });
                }

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addMailListDetail: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                let arrMail = JSON.parse(body.listMail);
                let listMail = [];
                arrMail.forEach(item => {
                    listMail.push(item.email)
                })

                var mailListDetailData = await mMailListDetail(db).findAll({
                    where: {
                        Email: {
                            [Op.in]: listMail
                        },
                        MailListID: body.mailListID
                    },
                    attributes: ['Email'],
                    raw: true
                });

                let bulkCreate = [];
                arrMail.forEach(mailItem => {
                    let index = mailListDetailData.findIndex(item => {
                        return item.Email == mailItem.email;
                    });
                    if (index < 0)
                        bulkCreate.push({
                            Email: mailItem.email,
                            Name: mailItem.name,
                            OwnerID: Number(body.userID),
                            TimeCreate: now,
                            MailListID: Number(body.mailListID)
                        })
                })

                await mMailListDetail(db).bulkCreate(bulkCreate);

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    deleteMailCampain: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                if (body.listID) {
                    let listID = JSON.parse(body.listID);
                    await mMailResponse(db).destroy({
                        where: {
                            MailCampainID: {
                                [Op.in]: listID
                            }
                        }
                    })
                    await mMailCampain(db).destroy({
                        where: {
                            ID: {
                                [Op.in]: listID
                            }
                        }
                    });
                }

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    deleteMailListDetail: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                if (body.listID) {
                    let listID = JSON.parse(body.listID);
                    await mMailResponse(db).destroy({
                        where: {
                            MailListDetailID: {
                                [Op.in]: listID
                            }
                        }
                    });
                    await mMailListDetail(db).destroy({
                        where: {
                            ID: {
                                [Op.in]: listID
                            }
                        }
                    });
                }

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addMailCampain: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                mailCampainData = await mMailCampain(db).create({
                    Name: body.name,
                    Subject: body.subject,
                    TimeCreate: now,
                    TimeEnd: moment(body.endTime).format('YYYY-MM-DD HH:mm:ss.SSS'),
                    OwnerID: Number(body.userID),
                    MailListID: Number(body.mailListID),
                })

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    id: mailCampainData.ID
                }

                res.json(result);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addMailResponse: async function (req, res) {
        let query = req._parsedUrl.query;
        let queryDecrypt = mModules.decryptKey(query.replace("token=", ""));

        let params = queryDecrypt.split('&');
        let ip = params[0].split('=')[1];
        let dbName = params[1].split('=')[1];
        let idMailDetail = params[2].split('=')[1];
        let idMailCampain = params[3].split('=')[1];

        database.checkServerInvalid(ip, dbName, '00a2152372fa8e0e62edbb45dd82831a').then(async db => {
            try {
                await mMailResponse(db).create({
                    MailListDetailID: idMailDetail,
                    TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    MailCampainID: idMailCampain,
                    Type: MAIL_RESPONSE_TYPE.OPEN
                })

                res.json(Result.ACTION_SUCCESS)
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addMailClickLink: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                await mMailResponse(db).create({
                    MailListDetailID: body.mailListDetailID,
                    TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    MailCampainID: body.campainID,
                    Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK
                })

                res.json(Result.ACTION_SUCCESS)
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addMailSend: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

                if (body.isTestMail) {
                    mAmazon.sendEmail(body.myMail, body.myMail, body.subject, body.body);
                    res.json(Result.ACTION_SUCCESS)
                } else {
                    var mailListDetailData = await mMailListDetail(db).findAll({
                        where: { MailListID: body.mailListID }
                    })

                    mailListDetailData.forEach(async (mailItem, i) => {

                        let tokenHttpTrack = `ip=${body.ip}&dbName=${body.dbName}&idMailDetail=${mailItem.ID}&idMailCampain=${body.campainID}`;
                        let tokenHttpTrackEncrypt = mModules.encryptKey(tokenHttpTrack);
                        let httpTrack = `<img src="http://163.44.192.123:3302/crm/open_mail?token=${tokenHttpTrackEncrypt}" height="1" width="1""/>`

                        let tokenUnsubscribe = `email=${mailItem.Email}&ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&campainID=${body.campainID}`;
                        let tokenUnsubscribeEncrypt = mModules.encryptKey(tokenUnsubscribe);
                        let unSubscribe = `<p>&nbsp;</p><p style="text-align: center;"><span style="font-size: xx-small;"><a href="http://unsubscribe.namanphu.tech/#/submit?token=${tokenUnsubscribeEncrypt}"><u><span style="color: #0088ff;">Click Here</span></u></a> to unsubscribe from this email</span></p>`

                        let bodyHtml = handleClickLink(body, mailItem.ID);

                        bodyHtml = httpTrack + bodyHtml;
                        bodyHtml = bodyHtml + unSubscribe;
                        bodyHtml = bodyHtml.replace(/#ten/g, mailItem.Name);

                        mCheckMail.checkEmail(mailItem.Email).then(async (checkMailRes) => {
                            if (checkMailRes == false) {
                                await mMailResponse(db).create({
                                    MailCampainID: body.campainID,
                                    MailListDetailID: mailItem.ID,
                                    TimeCreate: now,
                                    Type: Constant.MAIL_RESPONSE_TYPE.INVALID
                                });
                            }
                        })
                        mAmazon.sendEmail(body.myMail, mailItem.Email, body.subject, bodyHtml).then(async (sendMailRes) => {
                            if (sendMailRes)
                                await mMailResponse(db).create({
                                    MailCampainID: body.campainID,
                                    MailListDetailID: mailItem.ID,
                                    TimeCreate: now,
                                    Type: Constant.MAIL_RESPONSE_TYPE.SEND
                                });
                        });
                    });
                    res.json(Result.ACTION_SUCCESS)

                }
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    getMailListOption: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);

                var mMailListData = await mMailList(db).findAll({ where: where });
                var array = [];
                mMailListData.forEach(item => {
                    array.push({
                        id: Number(item.ID),
                        name: item.Name,
                    })
                })

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },


    updateMailCampain: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let update = [];
                if (body.name)
                    update.push({ key: 'Name', value: body.name });
                if (body.subject)
                    update.push({ key: 'Subject', value: body.subject });
                if (body.startTime) {
                    let time = moment(body.startTime).format('YYYY-MM-DD HH:mm:ss.SSS')
                    update.push({ key: 'TimeCreate', value: time });
                }
                if (body.endTime) {
                    let time = moment(body.endTime).format('YYYY-MM-DD HH:mm:ss.SSS')
                    update.push({ key: 'TimeEnd', value: time });
                }
                if (body.body) {
                    update.push({ key: 'Body', value: body.body });
                }
                if (body.mailListID)
                    update.push({ key: 'MailListID', value: body.mailListID });

                database.updateTable(update, mMailCampain(db), body.campainID).then(mailCampainRes => {
                    if (mailCampainRes == 1) {
                        res.json(Result.ACTION_SUCCESS);
                    }
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    reportEmailDetail: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var mailListDetail = mMailListDetail(db);
                mailListDetail.belongsTo(mMailList(db), { foreignKey: 'MailListID' })
                mailListDetail.belongsTo(mUser(db), { foreignKey: 'OwnerID' })

                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailCampain(db), { foreignKey: 'MailCampainID' })
                mailResponse.belongsTo(mailListDetail, { foreignKey: 'MailListDetailID' })


                var mailResponseData = await mailResponse.findAll({
                    include: [{
                        model: mMailCampain(db)
                    }, {
                        model: mailListDetail,
                        where: { Email: body.email },
                        include: [{
                            model: mMailList(db)
                        }, {
                            model: mUser(db)
                        }]
                    }]
                })

                var array = [];
                mailResponseData.forEach(item => {
                    array.push({
                        id: item.ID,
                        campainName: item.MailCampain.Name,
                        mailListName: item.MailListDetail.MailList.Name,
                        createTime: mModules.toDatetime(item.TimeCreate),
                        senderName: item.MailListDetail.User.Name,
                        status: 1
                    })
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    array
                }

                res.json(result);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    }


}