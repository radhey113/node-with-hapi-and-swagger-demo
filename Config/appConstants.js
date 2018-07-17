
'use strict';

var SERVER = {
    APP_NAME: 'Leila',
    PORTS: {
       HAPI: 8002
    },
    TOKEN_EXPIRATION_IN_MINUTES: 600,
    JWT_SECRET_KEY: '1233',
    GOOGLE_API_KEY : '',
    COUNTRY_CODE : '+91',
    MAX_DISTANCE_RADIUS_TO_SEARCH : '1',
    THUMB_WIDTH : 300,
    THUMB_HEIGHT : 300,
    BASE_DELIVERY_FEE : 25,
    COST_PER_KM: 9,
    DOMAIN_NAME : 'http://localhost:8081/',
    DEFAULT_PSWRD_FOR_AGENCY: '123456',
    POINT_FROM: 100,
    PUSH_NOTIFICATION_KEY: 'AIzaSyCKRBlvmdliCBUVElBV9KFyi1nJt7Q86w4'
};


var E_NUMS = {
    PUSH_NOTIFICATION_STATUS: [0, 1], // 0 Desable 1 enabl
    LIKE_DISLIKE: [1, 2, 3], // 1 For like, 2 for displike, 3 comment,
    OTHER_ACCOUTN_FOLLOW_FOLLOWING: [1, 2, 3], //1 for self, 2 for following, 3 not following
};

var DATABASE = {
    REPORT_REASON:{
        ABUSIVE:'ABUSIVE',
        INAPPROPRIATE:'INAPPROPRIATE',
        OTHERS: 'OTHERS',
        SEXUALLY_EXPLICIT:'SEXUALLY_EXPLICIT'
    },
    POST_TYPE : {
        NORMAL:'NORMAL',
        SPONSER : 'SPONSER',
        PRIVATE : 'PRIVATE',
    },
    MEDIA_TYPE : {
        VIDEO:'VIDEO',
        IMAGE : 'IMAGE',
        TEXT:'TEXT',
        OTHER:'OTHER'
    },
    NOTIFICATION : {
        FOLLOWINGYOU:'FOLLOWINGYOU',
        LIKE : 'LIKE',
        COMMENT : 'COMMENT',
        LIVE:'LIVE',
        TAG:'TAG'
    },

    PROFILE_PIC_PREFIX : {
        ORIGINAL : 'profilePic_',
        THUMB : 'profileThumb_'
    },
    LOGO_PREFIX : {
        ORIGINAL : 'logo_',
        THUMB : 'logoThumb_'
    },
    DOCUMENT_PREFIX : 'document_',

    USER_ROLES: {
        SUPERADMIN: 'SUPERADMIN',
        ADMIN: 'ADMIN',
        USER:'USER',
        MEMBER:'MEMBER',
        OBOY:'OBOY',
        SUBADMIN: 'SUBADMIN',
        AGENCY: 'AGENCY'
    },
    COUPON_TYPE:
    {
        FLAT:'FLAT',
        PERCENTAGE:'PERCENTAGE'
    },
    FILE_TYPES: {
        LOGO: 'LOGO',
        DOCUMENT: 'DOCUMENT',
        OTHERS: 'OTHERS'
    },
    DEVICE_TYPES: {
        IOS: 'IOS',
        ANDROID: 'ANDROID'
    },
    PACKAGE_TYPE: {
        DAILY: 1,
        WEEKLY: 2,
        MONTHLY: 3
    },
    STATUS_TYPES: {
        PENDING: 1,
        ACCEPT: 2,
        REJECT: 3,
        DELIVERED: 4,
        CANCEL:5
    },
    QUIZ_TYPE: {
        NUMERICAL: 1,
        LOGICAL: 2
    },
    LOGIN_METHOD: {
        NORMAL: 0,
        FB: 1,
        GMAIL: 2
    },
    POSTTYPE: {
        TEXT: 1,
        VIDEO: 2
    }
};

let STATUS_MSG = {
    ERROR: {

        CUSTOM_ERROR_MESSAG: (MES, STATUS_CODE) => {
              return {
                  statusCode:STATUS_CODE,
                  customMessage : MES,
                  type : 'CUSTOM_ERROR_MSG'
              }
        },

        SOMETHING_WENT_WRONG: {
            statusCode:500,
            customMessage : 'Something went wrong.',
            type : 'WENT_WRONG'
        },

        BLOCKED: {
            statusCode:401,
            customMessage : 'This account is blocked by Admin. Please contact support team to activate your account.',
            type : 'BLOCKED'
        },
        USER_ALREADY_EXIST: {
            statusCode:400,
            type: 'USER_ALREADY_EXIST',
            customMessage : 'Email address you have entered is already registered with us.'
        },
        USER_ALREADY_RATED: {
            statusCode:400,
            type: 'USER_ALREADY_RATED',
            customMessage : 'You have already rated the product'
        },
        ALREADY_REPORT: {
            statusCode:400,
            customMessage : 'This post has been already reported.',
            type: 'ALREADY_REPORT',
        },
        DATA_NOT_FOUND: {
            statusCode:400,
            customMessage : 'No data Found',
            type: 'DATA_NOT_FOUND',
        },
        TOKEN_ALREADY_EXPIRED: {
            statusCode:401,
            customMessage : 'Sorry, your account has been logged in other device! Please login again to continue.',
            type : 'TOKEN_ALREADY_EXPIRED'
        },
        DB_ERROR: {
            statusCode:400,
            customMessage : 'DB Error : ',
            type : 'DB_ERROR'
        },
        INVALID_ID: {
            statusCode:400,
            customMessage : 'Invalid Id Provided : ',
            type : 'INVALID_ID'
        },
        APP_ERROR: {
            statusCode:400,
            customMessage : 'Application Error',
            type : 'APP_ERROR'
        },
        IMP_ERROR: {
            statusCode:500,
            customMessage : 'Implementation Error',
            type : 'IMP_ERROR'
        },
        INVALID_TOKEN: {
            statusCode:401,
            customMessage : 'Invalid token provided',
            type : 'INVALID_TOKEN'
        },
        REGISTERFIRST: {
            statusCode:400,
            customMessage : 'The username you have entered does not match.',
            type : 'REGISTERFIRST'
        },
        INVALID_CODE: {
            statusCode:400,
            customMessage : 'Invalid Verification Code',
            type : 'INVALID_CODE'
        },
        EXPIRE_CODE: {
            statusCode:400,
            customMessage : 'Verification Code you have entered has been expired.',
            type : 'EXPIRE_CODE'
        },
        PASSWORD: {
            statusCode:400,
            customMessage : 'Password mismatch',
            type : 'PASSWORD'
        },
        OLD_PASSWORD_ENTERED: {
            statusCode:400,
            customMessage : 'You entered the same password',
            type : 'PASSWORD'
        },
        DEFAULT: {
            statusCode:400,
            customMessage : 'Error',
            type : 'DEFAULT'
        },
        PHONE_NO_EXIST: {
            statusCode:400,
            customMessage : 'Phone number you have entered is already registered with us.',
            type : 'PHONE_NO_EXIST'
        },
        PASS_LENGTH: {
            statusCode:400,
            customMessage : 'Password length must be at least 6 characters long.',
            type : 'PASS_LENGTH'
        },
        JOIN_ALREADY: {
            statusCode:400,
            customMessage : 'You already join the group',
            type : 'JOIN_ALREADY'
        },
        EMAIL_EXIST: {
            statusCode:400,
            customMessage : 'Email Already Exist',
            type : 'EMAIL_EXIST'
        },
        EMAIL_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Email not found',
            type : 'EMAIL_NOT_FOUND'
        },
        FACEBOOK_USER: {
            statusCode:400,
            customMessage : 'This account is registered from Facebook.',
            type : 'FACEBOOK_USER'
        },
        EMAIL_NOT_VERIFY: {
            statusCode:400,
            customMessage : 'Please verify your email first.',
            type : 'EMAIL_NOT_VERIFY'
        },
        INVALID_EMAIL: {
            statusCode:400,
            customMessage : 'Email is not registered',
            type : 'INVALID_EMAIL'
        },
        PASSWORD_REQUIRED: {
            statusCode:400,
            customMessage : 'Password is required',
            type : 'PASSWORD_REQUIRED'
        },
        NOT_FOUND: {
            statusCode:400,
            customMessage : 'Post Not Found',
            type : 'NOT_FOUND'
        },
        INCORRECT_PASSWORD: {
            statusCode:400,
            customMessage : 'Password you have entered does not match.',
            type : 'INCORRECT_PASSWORD'
        },
        INCORRECT_CURRENT_PASSWORD: {
            statusCode:400,
            customMessage : 'Current password you have entered does not match.',
            type : 'INCORRECT_CURRENT_PASSWORD'
        },
        PHONE_NOT_MATCH: {
            statusCode:400,
            customMessage : "Phone No. Doesn't Match",
            type : 'PHONE_NOT_MATCH'
        },
        SAME_PASSWORD: {
            statusCode:400,
            customMessage : 'Old password and new password cannot be same',
            type : 'SAME_PASSWORD'
        },
        EMAIL_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Email Address Already Exists',
            type : 'EMAIL_ALREADY_EXIST'
        },
        ERROR_PROFILE_PIC_UPLOAD: {
            statusCode:400,
            customMessage : 'Profile pic is not a valid file',
            type : 'ERROR_PROFILE_PIC_UPLOAD'
        },

        USERNAME_NOT_FOUND: {
            statusCode:400,
            customMessage : 'The username you have entered does not match.',
            type : 'USERNAME_NOT_FOUND'
        },
        LIVE_ENDED: {
            statusCode:400,
            customMessage : 'User ended the live streaming',
            type : 'LIVE_ENDED'
        },
        USERNAME_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Username you have entered is already registered with us.',
            type : 'USERNAME_ALREADY_EXIST'
        },

        INCORRECT_OLD_PASS: {
            statusCode:400,
            customMessage : 'Incorrect Old Password',
            type : 'INCORRECT_OLD_PASS'
        },

        UNAUTHORIZED: {
            statusCode:401,
            customMessage : 'You are not authorized to perform this action',
            type : 'UNAUTHORIZED'
        },

        DUPLICATE: {
            statusCode:400,
            customMessage : 'Duplicate Entry',
            type : 'DUPLICATE'
        },

        DUPLICATE_ADDRESS: {
            statusCode:400,
            customMessage : 'Address Already Exist',
            type : 'DUPLICATE_ADDRESS'
        },

        NOT_FOLLOW_URSELF: {
            statusCode:401,
            customMessage : 'User may not authorized to follow yourself',
            type : 'NOT_FOLLOW_URSELF'
        },

        ALREADY_FOLLOW: {
            statusCode:409,
            customMessage : 'You have already followed this user',
            type : 'ALREADY_FOLLOW'
        },

    },
    SUCCESS: {

        CREATED: {
            statusCode:200,
            customMessage : 'Created Successfully',
            type : 'CREATED'
        },

        CHECKEMAIL: {
            statusCode:200,
            customMessage : 'The reset password link has been sent to your email id.',
            type : 'CHECKEMAIL'
        },

        PASSWORD_CHANGE: {
            statusCode:200,
            customMessage : 'Password changed successfully',
            type : 'PASSWORD_CHANGE'
        },

        DEFAULT: {
            statusCode:200,
            customMessage : 'Success',
            type : 'DEFAULT'
        },
        UPDATED: {
            statusCode:200,
            customMessage : 'Updated Successfully',
            type : 'UPDATED'
        },
        OTP_SENT: {
            statusCode:200,
            customMessage : 'Otp sent successfully',
            type : 'OTP_SENT'
        },

        LOGOUT: {
            statusCode:200,
            customMessage : 'Logged Out Successfully',
            type : 'LOGOUT'
        },
        DELETED: {
            statusCode:200,
            customMessage : 'Deleted Successfully',
            type : 'DELETED'
        },
        BLOCK: {
            statusCode:200,
            customMessage : 'User blocked',
            type : 'BLOCK'
        },
        UNBLOCK: {
            statusCode:200,
            customMessage : 'User Unblocked',
            type : 'UNBLOCK'
        },
    }
};

var swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

var CUSTOM_ERROR_MSG = {
  AGENCY_ALREADY_EXIST : 'Agency already exist',
  MORE_THEN_ONE_ANSWER: 'You entered more then one answer',
  NOT_ENTERED_ANSWER: 'You have not entered any answer',
  QUIZ_NOT_FOUNT: 'Invalid Quiz',
  ID_MISSING: 'Id is missing'
};

var QUIZ_RESULTS = {
    FAIL: 0,
    AVERAGE: 1,
    GOOD: 2,
    VERY_GOOD: 3,
    EXCELLENT: 4
};

var LISTING_TYPE= {
    FOLOWING: 1,
    FOLOWER: 2,
    PRODUCT_CATEGORY: 3,
    TEXT_DISCUSION: 4,
    MEDIA_DISCUSION: 5,
    PRODUCT: 6,
    PRODUCT_REVIEW: 7,
    USER: 8,
    POST: 9,
    SERVICE_CATEGORY: 10,
    SERVICE: 11,
    MARKETING_PRODUCT: 12
};

let EMAIL_STATUS = {
  FORGET_PASSWORD: "Forget Password",
};

let EMAIL_CONTENT = {
  FORGET_CONTENT: 'Your OTP is '
};



let EMAIL_SEND = {
    S_E_S_Config : {
    accessKeyId:'AKIAJ3BSUGE2N6F7BREA',
    secretAccessKey:'313vF4OBn5J0md5nBP0zAoRYGlbyJV1XtDiKX23/',
    region:'us-west-2'
    },
    FROM_EMAIL: 'MotorNation motornationapp2@gmail.com'
};

let NotificationMessage = {
    like: "like on your post",
    comment: "comment on your post",
    follow: "following you",
    likeBy: "is also like the post",
    commentBy: "is also comment on the post"
};

let NotificationMsg = (msg, name)=>{
    return name + " " + msg;
};


var APP_CONSTANTS = {
    SERVER: SERVER,
    DATABASE: DATABASE,
    STATUS_MSG: STATUS_MSG,
    swaggerDefaultResponseMessages: swaggerDefaultResponseMessages,
    E_NUMS: E_NUMS,
    CUSTOM_ERROR_MSG: CUSTOM_ERROR_MSG,
    QUIZ_RESULTS: QUIZ_RESULTS,
    LISTING_TYPE: LISTING_TYPE,
    EMAIL_STATUS: EMAIL_STATUS,
    EMAIL_CONTENT: EMAIL_CONTENT,
    EMAIL_SEND: EMAIL_SEND,
    NotificationMsg: NotificationMsg,
    NotificationMessage: NotificationMessage
};

module.exports = APP_CONSTANTS;
