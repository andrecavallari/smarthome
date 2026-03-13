'use server';

import db from '@/clients/db';

export async function getControllers() {
  const controllers = await db('controllers').select('*');
  return controllers;
}
