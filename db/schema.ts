import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
  updated_at: integer({ mode: 'timestamp' }),
  created_at: integer({ mode: 'timestamp' }),
  deleted_at: integer({ mode: 'timestamp' }),
}

export const patient = sqliteTable('patient', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  name: text('name').notNull(),
  lastname: text('lastname').notNull(),
  dni: text('dni').notNull().unique(),
  ...timestamps
});

export const shift = sqliteTable('shift', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patient_id: integer('patient_id').notNull().references(() => patient.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  start_time: text('start_time').notNull(),
  duration: integer('duration').notNull().default(60),
  status: text({ enum: ['pending', 'confirmed', 'canceled'] }).notNull().default('pending'),
  reason_incomplete: text(),
  details: text(),
  reprogramed: integer({ mode: 'boolean' }).notNull().default(false),
  ...timestamps
});

export const availableDay = sqliteTable('available_day', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  day_name: text('day_name', {
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  }).notNull().unique(),
  ...timestamps
});


export const availableTime = sqliteTable('available_time', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  day_id: integer('day_id').notNull().references(() => availableDay.id),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  ...timestamps
});

export type Patient = typeof patient.$inferInsert;
export type Shift = typeof shift.$inferInsert;
export type AvailableDay = typeof availableDay.$inferInsert;
export type AvailableTime = typeof availableTime.$inferInsert;