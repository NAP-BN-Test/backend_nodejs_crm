const Constant = require('../constants/constant');
const Op = require('sequelize').Op;

const Result = require('../constants/result');

var moment = require('moment');

var database = require('../db');
var user = require('../controllers/user');
const modules = require('../constants/modules');

let mAdditionalInformation = require('../tables/additional-infomation');

module.exports = {
    getListAdditionalInformation: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mAdditionalInformation(db).count().then(all => {
                mAdditionalInformation(db).findAll({
                    order: [['TimeCreate', 'DESC']],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                }).then(data => {
                    let array = [];
                    if (data) {
                        data.forEach(item => {
                            array.push({
                                ID: item.ID,
                                OurRef: item.OurRef ? item.OurRef : null,
                                PAT: item.PAT ? item.PAT : null,
                                Applicant: item.Create_ApplicantDate ? item.Applicant : null,
                                ApplicantNo: item.ApplicantNo ? item.ApplicantNo : null,
                                ClassA: item.ClassA ? item.ClassA : null,
                                FilingDate: item.FilingDate ? item.FilingDate : null,
                                PriorTrademark: item.PriorTrademark ? item.PriorTrademark : null,
                                OwnerID: item.OwnerID ? item.OwnerID : null,
                                RedNo: item.RedNo ? item.RedNo : null,
                                ClassB: item.ClassB ? item.ClassB : null,
                                Firm: item.Firm ? item.Firm : null,
                                Address: item.Address ? item.Address : null,
                                Tel: item.Tel ? item.Tel : null,
                                Fax: item.Fax ? item.Fax : null,
                                Email: item.Email ? item.Email : null,
                                Status: item.Status ? item.Status : null,
                                Rerminder: item.Rerminder ? item.Rerminder : null,
                                UserID: item.UserID ? item.UserID : null,
                                TimeStart: mModules.toDatetime(item.timeStart) ? item.timeStart : null,
                                TimeRemind: mModules.toDatetime(item.timeRemind) ? item.timeRemind : null,
                                TimeCreate: mModules.toDatetime(item.TimeCreate),
                                TimeUpdate: mModules.toDatetime(item.TimeUpdate),
                                Description: mModules.toDatetime(item.description),
                            });
                        });

                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array, all
                        }

                        res.json(result);
                    }
                })
            })
        })
    },
    addAdditionalInformation: (req, res) => {
        let body = req.body;
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mAdditionalInformation(db).create({
                OurRef: body.OurRef ? body.OurRef : null,
                PAT: body.PAT ? body.PAT : null,
                Applicant: body.Create_ApplicantDate ? body.Applicant : null,
                ApplicantNo: body.ApplicantNo ? body.ApplicantNo : null,
                ClassA: body.ClassA ? body.ClassA : null,
                FilingDate: body.FilingDate ? body.FilingDate : null,
                PriorTrademark: body.PriorTrademark ? body.PriorTrademark : null,
                OwnerID: body.OwnerID ? body.OwnerID : null,
                RedNo: body.RedNo ? body.RedNo : null,
                ClassB: body.ClassB ? body.ClassB : null,
                Firm: body.Firm ? body.Firm : null,
                Address: body.Address ? body.Address : null,
                Tel: body.Tel ? body.Tel : null,
                Fax: body.Fax ? body.Fax : null,
                Email: body.Email ? body.Email : null,
                Status: body.Status ? body.Status : null,
                Rerminder: body.Rerminder ? body.Rerminder : null,
                UserID: body.UserID ? body.UserID : null,
                TimeStart: moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS') ? body.timeStart : null,
                TimeRemind: body.timeRemind ? moment(body.timeRemind).format('YYYY-MM-DD HH:mm:ss.SSS') : null,
                TimeCreate: now,
                TimeUpdate: now,
                Description: body.description,
            }).then(data => {
                obj = {
                    OurRef: data.OurRef ? data.OurRef : null,
                    PAT: data.PAT ? data.PAT : null,
                    Applicant: data.Create_ApplicantDate ? data.Applicant : null,
                    ApplicantNo: data.ApplicantNo ? data.ApplicantNo : null,
                    ClassA: data.ClassA ? data.ClassA : null,
                    FilingDate: data.FilingDate ? data.FilingDate : null,
                    PriorTrademark: data.PriorTrademark ? data.PriorTrademark : null,
                    OwnerID: data.OwnerID ? data.OwnerID : null,
                    RedNo: data.RedNo ? data.RedNo : null,
                    ClassB: data.ClassB ? data.ClassB : null,
                    Firm: data.Firm ? data.Firm : null,
                    Address: data.Address ? data.Address : null,
                    Tel: data.Tel ? data.Tel : null,
                    Fax: data.Fax ? data.Fax : null,
                    Email: data.Email ? data.Email : null,
                    Status: data.Status ? data.Status : null,
                    Rerminder: data.Rerminder ? data.Rerminder : null,
                    UserID: data.UserID ? data.UserID : null,
                    TimeStart: mModules.toDatetime(data.timeStart) ? data.timeStart : null,
                    TimeRemind: mModules.toDatetime(data.timeRemind) ? data.timeRemind : null,
                    TimeCreate: mModules.toDatetime(data.TimeCreate),
                    TimeUpdate: mModules.toDatetime(data.TimeUpdate),
                    Description: mModules.toDatetime(data.description),
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    obj: obj
                }
                res.json(result);
            }, err => {
                var result = {
                    status: Constant.STATUS.FAIL,
                    message: Constant.MESSAGE.BINDING_ERROR,
                    ojb: err.fields
                }
                res.json(result);
            })
        })
    },
    updateAdditionalInformation: (req, res) => {
        let body = req.body;
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.OurRef)
                    update.push({ key: 'OurRef', value: body.OurRef });
                if (body.PAT)
                    update.push({ key: 'PAT', value: body.PAT });
                if (body.Applicant)
                    update.push({ key: 'Applicant', value: body.Applicant });
                if (body.ApplicantNo)
                    update.push({ key: 'ApplicantNo', value: body.ApplicantNo });
                if (body.ClassA)
                    update.push({ key: 'ClassA', value: body.ClassA });
                if (body.FilingDate)
                    update.push({ key: 'FilingDate', value: body.FilingDate });
                if (body.PriorTrademark)
                    update.push({ key: 'PriorTrademark', value: body.PriorTrademark });
                if (body.OwnerID)
                    update.push({ key: 'OwnerID', value: body.OwnerID });
                if (body.RedNo)
                    update.push({ key: 'RedNo', value: body.RedNo });
                if (body.ClassB)
                    update.push({ key: 'ClassB', value: body.ClassB });
                if (body.Firm)
                    update.push({ key: 'Firm', value: body.Firm });
                if (body.Address)
                    update.push({ key: 'Address', value: body.Address });
                if (body.Tel)
                    update.push({ key: 'Tel', value: body.Tel });
                if (body.Fax)
                    update.push({ key: 'Fax', value: body.Fax });
                if (body.Email)
                    update.push({ key: 'Email', value: body.Email });
                if (body.Status)
                    update.push({ key: 'Status', value: body.Status });
                if (body.Rerminder)
                    update.push({ key: 'Rerminder', value: body.Rerminder });
                if (body.UserID)
                    update.push({ key: 'UserID', value: body.UserID });
                if (body.TimeRemind)
                    update.push({ key: 'TimeRemind', value: body.TimeRemind });
                if (body.TimeUpdate)
                    update.push({ key: 'TimeUpdate', value: body.TimeUpdate });
                if (body.TimeCreate)
                    update.push({ key: 'TimeCreate', value: body.TimeCreate });
                if (body.Description)
                    update.push({ key: 'Description', value: body.Description });

                database.updateTable(update, mAdditionalInformation(db), body.ID).then(response => {
                    if (response == 1) {
                        res.json(Result.ACTION_SUCCESS);
                    } else {
                        res.json(Result.SYS_ERROR_RESULT);
                    }
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    getDetailAdditionalInformation: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mAdditionalInformation(db).findOne({
                where: { ID: body.ID },
            }).then(data => {
                if (data) {
                    obj = {
                        ID: data.ID,
                        OurRef: data.OurRef ? data.OurRef : null,
                        PAT: data.PAT ? data.PAT : null,
                        Applicant: data.Create_ApplicantDate ? data.Applicant : null,
                        ApplicantNo: data.ApplicantNo ? data.ApplicantNo : null,
                        ClassA: data.ClassA ? data.ClassA : null,
                        FilingDate: data.FilingDate ? data.FilingDate : null,
                        PriorTrademark: data.PriorTrademark ? data.PriorTrademark : null,
                        OwnerID: data.OwnerID ? data.OwnerID : null,
                        RedNo: data.RedNo ? data.RedNo : null,
                        ClassB: data.ClassB ? data.ClassB : null,
                        Firm: data.Firm ? data.Firm : null,
                        Address: data.Address ? data.Address : null,
                        Tel: data.Tel ? data.Tel : null,
                        Fax: data.Fax ? data.Fax : null,
                        Email: data.Email ? data.Email : null,
                        Status: data.Status ? data.Status : null,
                        Rerminder: data.Rerminder ? data.Rerminder : null,
                        UserID: data.UserID ? data.UserID : null,
                        TimeStart: mModules.toDatetime(data.timeStart) ? data.timeStart : null,
                        TimeRemind: mModules.toDatetime(data.timeRemind) ? data.timeRemind : null,
                        TimeCreate: mModules.toDatetime(data.TimeCreate),
                        TimeUpdate: mModules.toDatetime(data.TimeUpdate),
                        Description: mModules.toDatetime(data.description)
                    }
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        obj: obj
                    }
                    res.json(result);
                }
                else {
                    var result = {
                        status: Constant.STATUS.FAIL,
                        message: Constant.MESSAGE.DATA_NOT_FOUND,
                    }
                    res.json(result);
                }
            })
        })
    },
    deleteAdditionalInformation: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mAdditionalInformation(db).destroy({ where: { ID: body.ID } }).then(() => {
                res.json(Result.ACTION_SUCCESS);
            });
        }, err => {
            var result = {
                status: Constant.STATUS.FAIL,
                message: Constant.MESSAGE.BINDING_ERROR,
                ojb: err.fields
            }
            res.json(result);
        });
    },
}