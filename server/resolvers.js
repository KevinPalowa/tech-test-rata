const knex = require('knex')(require('./knexfile').development);
const { v4: uuidv4 } = require('uuid'); // I need to install uuid or just use a simple generator

const normalizePatient = (patient) => {
  if (!patient) return null;
  return {
    ...patient,
    allergies: patient.allergies ? JSON.parse(patient.allergies) : [],
    tags: patient.tags ? JSON.parse(patient.tags) : [],
  };
};

const resolvers = {
  Query: {
    patients: async (_, { search, limit = 6, offset = 0 }) => {
      let query = knex('patients');
      let countQuery = knex('patients');

      if (search) {
        const normalized = `%${search.toLowerCase()}%`;
        const filter = function () {
          this.where('name', 'like', normalized)
            .orWhere('phone', 'like', normalized)
            .orWhere('tags', 'like', normalized);
        };
        query = query.where(filter);
        countQuery = countQuery.where(filter);
      }

      const totalCountResult = await countQuery.count('id as count').first();
      const totalCount = totalCountResult ? parseInt(totalCountResult.count) : 0;

      const patients = await query
        .orderBy('id', 'desc')
        .limit(limit)
        .offset(offset);

      return {
        patients: patients.map(normalizePatient),
        totalCount,
      };
    },
    patient: async (_, { id }) => {
      const patient = await knex('patients').where({ id }).first();
      return normalizePatient(patient);
    },
    appointments: async (_, { start, end }) => {
      let query = knex('appointments');
      if (start) query = query.where('date', '>=', start);
      if (end) query = query.where('date', '<=', end);
      return await query;
    },
    appointment: async (_, { id }) => {
      return await knex('appointments').where({ id }).first();
    },
    workflow: async () => {
      return await knex('workflow_steps');
    },
  },
  Mutation: {
    createPatient: async (_, { input }) => {
      const id = uuidv4();
      const newPatient = {
        id,
        ...input,
        allergies: JSON.stringify(input.allergies || []),
        tags: JSON.stringify(input.tags || []),
      };
      await knex('patients').insert(newPatient);
      return normalizePatient(newPatient);
    },
    updatePatient: async (_, { id, input }) => {
      const updatedData = {
        ...input,
        allergies: JSON.stringify(input.allergies || []),
        tags: JSON.stringify(input.tags || []),
      };
      await knex('patients').where({ id }).update(updatedData);
      const patient = await knex('patients').where({ id }).first();
      return normalizePatient(patient);
    },
    upsertPatient: async (_, { id, input }) => {
      if (id) {
        const existing = await knex('patients').where({ id }).first();
        if (existing) {
          return resolvers.Mutation.updatePatient(_, { id, input });
        }
      }
      return resolvers.Mutation.createPatient(_, { input });
    },
    createAppointment: async (_, { input }) => {
      const id = uuidv4();
      const newAppointment = {
        id,
        ...input,
      };
      await knex('appointments').insert(newAppointment);
      return newAppointment;
    },
    updateAppointment: async (_, { id, input }) => {
      await knex('appointments').where({ id }).update(input);
      return await knex('appointments').where({ id }).first();
    },
    deleteAppointment: async (_, { id }) => {
      const deleted = await knex('appointments').where({ id }).del();
      return deleted > 0;
    },
    saveWorkflow: async (_, { steps }) => {
      await knex('workflow_steps').del();
      if (!steps || steps.length === 0) return [];
      const formattedSteps = steps.map((step, index) => ({
        id: step.id || `wf-${index + 1}`,
        name: step.name,
      }));
      await knex('workflow_steps').insert(formattedSteps);
      return formattedSteps;
    },
  },
  Patient: {
    appointments: async (patient) => {
      return await knex('appointments').where({ patientId: patient.id });
    },
  },
  Appointment: {
    patient: async (appointment) => {
      const patient = await knex('patients').where({ id: appointment.patientId }).first();
      return normalizePatient(patient);
    },
  },
};

module.exports = resolvers;
