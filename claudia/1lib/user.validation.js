const Joi = require('joi');

const schema = {
  schema: {
    given_name: Joi.string().trim().required(),
    middle_name: Joi.string().trim(),
    family_name: Joi.string().trim().required(),
    email: Joi.string().trim().lowercase().min(5).max(200).email().required(),
    password: Joi.string().trim().min(8).max(250).required(),
    confirmPassword: Joi.string().trim().required().valid(Joi.ref('password')).options({
      language: {
        any: {
          allowOnly: 'Passwords and confirm password are not identical'
        }
      }
    }),
    phone_number: Joi.number(),
    address: Joi.string().trim(),
    address2: Joi.string().trim(),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    postal: Joi.string().trim(),
    country: Joi.string().trim(),
    picture: Joi.string().trim(),
    profile: Joi.string().trim(),
    timezone: Joi.string().trim(),
    is_retired: Joi.boolean(),
    occupation: Joi.string().trim(),
    employer: Joi.string().trim(),
    email_list_optin_at: Joi.string().trim(),
    pay_type: Joi.string().trim(),
    pay_cid: Joi.string().trim(),
    pay_brand: Joi.string().trim(),
    pay_last4: Joi.number(),
    pay_xmonth: Joi.number(),
    pay_xyear: Joi.number(),
    create_at: Joi.string(),
    update_at: Joi.string(),
    enabled: Joi.boolean(),
    status: Joi.string(),
    email_verified: Joi.boolean(),
    phone_number_verified: Joi.boolean(),
    website: Joi.string().trim().uri()
  },
  custom: [
    'is_retired', 'occupation', 'employer',
    'address2', 'city', 'state', 'postal', 'country', 'email_list_optin_at',
    'pay_type', 'pay_cid', 'pay_brand', 'pay_last4', 'pay_xmonth', 'pay_xyear'
  ]
};

module.exports = schema;
