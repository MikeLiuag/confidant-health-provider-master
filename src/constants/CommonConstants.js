/*==================Code For Production Specific Credentials====================*/
import Config from "react-native-config";
import {Colors, extractDynamicConfigurations} from "ch-mobile-shared";
import RemoteConfig from './../../configurations.json';

let applicationConfig = extractDynamicConfigurations(RemoteConfig);
if (!applicationConfig) {
    throw new Error("Unable to find dynamic environment configurations. Please check that the environment specific build scripts you used didn't throw any error. i.e. ./build-latest-dev.sh");
}

console.log('Loading' + Config.REACT_APP_ENVIRONMENT + ' credentials');

export const S3_BUCKET_LINK = applicationConfig['s3.bucket.url'];
export const OPENTOK_APIKEY = applicationConfig['opentok.apiKey'];
export const STRIPE_PUBLISHABLE_KEY = applicationConfig['stripe.publishableKey'];
export const ONESIGNAL_APP_ID = applicationConfig['onesignal.appId'];
export const SENDBIRD_APP_ID = applicationConfig['sendbird.appId'];
export const CONTENTFUL_SPACE_ID = applicationConfig['contentful.spaceId'];
export const CONTENTFUL_ACCESS_TOKEN = applicationConfig['contentful.accessToken'];
export const SEGMENT_WRITE_KEY = applicationConfig['segment.writeKey'];
export const S3_CLIENT_OPTIONS = {
    region: applicationConfig['s3.client.region'],
    accessKey: applicationConfig['s3.client.accessKey'],
    secretKey: applicationConfig['s3.client.secretKey'],
    successActionStatus: applicationConfig['s3.client.successActionStatus'],
    bucket: applicationConfig['s3.bucket.name'],
};
export const INSTABUG_TOKEN = applicationConfig['instabug.token'];
/*=======================================Code ENDS==========================================*/

export const VERIFICATION_CODE_TYPE = {
    PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
};

export const AVATAR_COLOR_ARRAY = ['#7a00e7', '#f78795', '#d97eff', '#2bb826', '#ff7f05'];
export const DEFAULT_AVATAR_COLOR = '#505D80';
export const DEFAULT_GROUP_IMAGE = 'profileImages/testUser_defaultGroupAvatar.png';
export const USER_TYPE = 'PRACTITIONER';
export const HEADER_X = 78;
export const HEADER_NORMAL = 70;
export const MARGIN_X = -42;
export const MARGIN_NORMAL = -18;
export const ERROR_NOT_FOUND = 'NOT_FOUND';
export const ONE_STAR_RATING = '1.0';
export const FIVE_STAR_RATING = '5.0';
export const COST_REGEX = /^\d+\.\d{0,2}$/;
export const DOSE_REGEX = /^\d+\.\d{0,2}$/;

export const SessionQualityIssuesOptions = [
    {
        title: 'No Connection Issues',
        description: 'You were able to connect with the patient as expected',
        state: 'connectionIssues'
    },
    {
        title: 'No Reminder Issues',
        description: 'The reminders worked as expected for the appointment',
        state: 'reminderIssues'
    },
    {
        title: 'No Communication Issues',
        description: 'You were able to communicate with the patient as needed',
        state: 'communicationIssues'
    },
];

export const APPOINTMENT_STATUS = {
    PROPOSED: 'PROPOSED',
    PENDING: 'PENDING',
    BOOKED: 'BOOKED',
    ARRIVED: 'ARRIVED',
    FULFILLED: 'FULFILLED',
    CANCELLED: 'CANCELLED',
    ENTERED_IN_ERROR: 'ENTERED_IN_ERROR',
    CHECKED_IN: 'CHECKED_IN',
    WAITLIST: 'WAITLIST',
    CONFIRMED : 'CONFIRMED',
    REQUESTED : "REQUESTED"
};

export const SEGMENT_EVENT = {
    APPOINTMENT_REQUESTED: 'Appointment Requested',
    APPOINTMENT_CONFIRMED: 'Appointment Confirmed',
    APPOINTMENT_CANCELLED: 'Appointment Cancelled',
    APPOINTMENT_SIGN_OFF_NOTES_COMPLETED: 'Appointment Sign off notes completed',
    TELEHEALTH_SESSION_STARTED: 'Telehealth Session Started',
    TELEHEALTH_SESSION_COMPLETED: 'Telehealth Session Completed',
    TELEHEALTH_SESSION_ENDED: 'Telehealth Session Ended',
    TELEHEALTH_SESSION_FEEDBACK_COMPLETED: 'Telehealth Session Feedback Completed',
    GROUP_CHAT_MESSAGE_SENT: 'Group Chat Message Sent',
    GROUP_SESSION_COMPLETED: 'Group Session Completed',
    SECTION_OPENED: 'Section Opened',
    TOPIC_OPENED: 'Topic Opened',
    EDUCATION_OPENED: 'Education Opened',
    EDUCATION_BOOKMARKED: 'Education Bookmarked',
    EDUCATION_MARKED_AS_READ: 'Education Marked As Read',
    APP_SHARED: 'App Shared',
    PROFILE_UPDATED: 'Profile Updated',
    GROUP_SESSION_JOINED: 'Group session joined',
    APPOINTMENT_CHANGE_REQUESTED: 'Appointment Change Requested',
    RECOMMENDED_EDUCATION_CONTENT: 'Recommended Education Content',
    ASSIGNED_CHATBOT: 'Assigned Chatbot',
    NEW_LOGIN: 'New Login',
    NEW_MEMBER_CONNECTION: 'New Member Connection',
    DATA_DOMAIN_ELEMENT_ADDED: 'Data Domain Element Added'
};
export const DOMAIN_IMPORTANCE_COLORS = {
    CRITICAL: {
        textColor: Colors.colors.errorText,
        bgColor: Colors.colors.white
    },
    HIGH: {
        textColor: Colors.colors.errorText,
        bgColor: Colors.colors.white
    },
    MEDIUM: {
        textColor: Colors.colors.warningText,
        bgColor: Colors.colors.white
    },
    LOW: {
        textColor: Colors.colors.primaryText,
        bgColor: Colors.colors.white
    },
    MISREPORTED: {
        textColor: Colors.colors.secondaryText,
        bgColor: Colors.colors.white
    },
    UNRELATED: {
        textColor: Colors.colors.lowContrast,
        bgColor: Colors.colors.white
    },
    RESOLVED: {
        textColor: Colors.colors.successText,
        bgColor: Colors.colors.white
    },
    POSITIVE: {
        textColor: Colors.colors.successText,
        bgColor: Colors.colors.white
    },
    NEGATIVE: {
        textColor: Colors.colors.errorText,
        bgColor: Colors.colors.white
    },
    NEUTRAL: {
        textColor: Colors.colors.primaryText,
        bgColor: Colors.colors.white
    }
}

export const GROUP_MANAGEMENT_DETAILS_ACTIONS = {
    ADD: 'ADD',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
}

export const GROUP_MANAGEMENT_LIST_TYPES = {
    GROUP_RULES: 'groupRules',
    WHO_CAN_BENEFITS: 'whoCanBenefits',
    TAGS: 'tags',
    MEETINGS: 'meetings'
}

export const PLAN_STATUS = {
    IN_PROGRESS: 'In Progress',
    SCHEDULED: 'Scheduled',
    NOT_STARTED: 'Not Started',
    COMPLETED: 'Completed'
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SLOTS_TYPES = {
    AVAILABLE: 'AVAILABLE',
    REQUEST_PENDING: 'REQUEST_PENDING',
    BOOKED: 'BOOKED',
    REQUEST_SENT: 'REQUEST_SENT'
}

export const TIME_TYPES = {
    START_TIME: 'startTime',
    END_TIME: 'endTime'
}

export const CRUD_OPERATIONS_ENUMS = {
    ADD: 'ADD',
    UPDATE: 'UPDATE'
}

export const TIME_PICKER = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24'
];

export const MINUTE_PICKER = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'
];

export const MINUTE_PICKER_SCHEDULE = [
    '00','15', '30', '45', '59'
];

export const CONTACT_NOTES_FLAGS = {
    PROHIBITIVE: 'PROHIBITIVE',
    CAUTION: 'CAUTION',
    RELEASE_OF_INFORMATION: 'RELEASE_OF_INFORMATION',
    LAB_REQUEST: 'LAB_REQUEST',
    CONTACT: 'CONTACT',
    GENERAL: 'GENERAL',
};

export const CONTACT_NOTES_TIME = ['15 minutes','30 minutes','45 minutes','60 minutes'];


export const CONTACT_NOTES_TYPES = {
    GENERAL  : [
        'Low or Moderate Risk for Suicidal Ideation as per protocol',
        'Low or Moderate Risk for Homicidal Ideation as per protocol',
        'History of Drug-Seeking Behavior',
        'History of Eating Disorder',
        'History of Violence',
        'Significant history of no-shows for appointments',
        'Active self-harm behaviors (with no suicidal ideation)',
        'Pregnancy (for services other than OUD)',
        'Child Protection Involvement (current or historical)',
        'Criminal Justice System Involvement (current or historical)',
        'Secondary Chronic Pain',
        'Significant Psychiatric History',
        'Safety concerns in the home (Domestic Violence)',
        'Undergoing active Suboxone Induction',
        'History of Non-Disclosure of Medications Prescribed',
        'Comorbid medical, mental health, and/or SUD/AUD diagnoses',
        'Allergy',
        'Other'
    ],
    CONTACT: [
        'Phone Call',
        'Email'
    ],
    CAUTION: [
        'Low or Moderate Risk for Suicidal Ideation as per protocol',
        'Low or Moderate Risk for Homicidal Ideation as per protocol',
        'History of Drug-Seeking Behavior',
        'History of Eating Disorder',
        'History of Violence',
        'Significant history of no-shows for appointments',
        'Active self-harm behaviors (with no suicidal ideation)',
        'Pregnancy (for services other than OUD)',
        'Child Protection Involvement (current or historical)',
        'Criminal Justice System Involvement (current or historical)',
        'Secondary Chronic Pain',
        'Significant Psychiatric History',
        'Safety concerns in the home (Domestic Violence)',
        'Undergoing active Suboxone Induction',
        'History of Non-Disclosure of Medications Prescribed',
        'Comorbid medical, mental health, and/or SUD/AUD diagnoses',
        'Allergy',
        'Other'
    ],

    PROHIBITIVE:[
        'High Risk for Suicidal Ideation as per protocol',
        'High Risk for Homicidal Ideation as per protocol',
        'Current drug seeking behavior',
        'Current diagnosis of acute Eating Disorder',
        'Active self-harm behaviors with suicidal ideation',
        'Threatened Provider during session',
        'Current diversion concerns',
        'Active Withdrawal with physical symptoms as listed in exclusionary criteria',
        'Pregnancy (for OUD)',
        'Taking Medications not as Prescribed',
        'Chronic Pain Primary (for OUD)',
        'Active Non-Disclosure of Medications Prescribed',
        'Requires Higher Level of Care',
        'Other',
    ],

    LAB_REQUEST : [
        'CBC with Differential',
        'Complete Metabolic Panel',
        'Hepatic Panel',
        'General Hepatitis Panel',
        'HIV Panel',
        'Lithium Levels',
        'Depakote Levels',
        'Tegretol Levels',
        'Other',
    ],

    RELEASE_OF_INFORMATION: [
        'Name',
        'Phone',
        'Email',
        'Fax',
        'Address',
    ]

};

export const REMOVAL_REASONS = [
    'Resolved',
    'Reported on accident',
    'Other'
];

export const CRUD_ACTIONS = {
    ADD: 'ADD',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
}



export const PROVIDER_ROLES = {
    DEFAULT : "DEFAULT",
    SUPERVISOR : "SUPERVISOR",
    ASSOCIATE : "ASSOCIATE",
}

export const APPOINTMENT_SIGNOFF_STATUS = {
    DRAFTED : "DRAFTED",
    REVIEW : "REVIEW",
    REJECTED : "REJECTED",
    APPROVED : "APPROVED"
}


export const NOTES = {
    SUBJECTIVE : "SUBJECTIVE",
    OBJECTIVE : "OBJECTIVE",
    ASSESSMENT : "ASSESSMENT",
    PLAN : "PLAN"
}


export const HISTORY_CONSTANT={
    "sexAssigned": "Sex Assigned",
    "genderIdentity": "Gender Identity",
    "genderPronoun": "Gender Pronoun",
    "previouslySeenProvider": "Previously Seen Provider",
    "previouslyDiagnosed": "Previously Diagnosed",
    "previousOverDose": "Previous Over Dose",
    "previouslyHospitalizedForPsychiatricCare": "Previously Hospitalized For Psychiatric Care",
    "previousSuicideAttempt": "Previous Suicide Attempt",
    "hasSupportNetwork": "Has Support Network",
    "criminalJusticeInvolvement": "Criminal Justice Involvement",
    "previouslyDiagnosedMentalHealthConditions":"Previously Diagnosed Mental Health Conditions",
    "mentalHealthConditionsCurrentlyTreatedFor": "Mental Health Conditions Currently Treated For",
    "familyMentalHealthConditions": "Family Mental Health Conditions",
    "previouslyDiagnosedMedicalConditions": "Previously Diagnosed Medical Conditions",
    "medicalConditionsCurrentlyTreatedFor": "Medical Conditions Currently Treated For",
    "familyMedicationConditions": "Family Medication Conditions",
    "previousProblemsWithMedication": "Previous Problems With Medication",
    "previouslyReceivedSubstanceUseTreatment": "Previously Received Substance Use Treatment",
    "allergies": "Allergies",
    "preferredPharmacy": "Preferred Pharmacy"
}

export const CONTACT_NOTES_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    REMOVED: 'REMOVED'
};
