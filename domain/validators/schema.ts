import joi from 'joi';

const patientSchema = joi.object({
  name: joi.string().required(),
  lastname: joi.string().required(),
  dni: joi.string().required().regex(/^[0-9]{8}$/),
});

const shiftSchema = joi.object({
  patient_id: joi.number().required().integer().positive(),
  date: joi.string().required(),
  start_time: joi.string().required(),
  duration: joi.number().required().integer().positive(),
  status: joi.string().optional().valid('pending', 'confirmed', 'canceled'),
  reason_incomplete: joi.string().optional(),
  details: joi.string().optional().min(10).max(500),
});

const updateStatusSchema = joi.object({
  status: joi.string().required().valid('pending', 'confirmed', 'canceled'),
  reason_incomplete: joi.string().optional().min(4).max(500).allow('', null),
});

export default {
    patientSchema,
    shiftSchema,
    updateStatusSchema
}