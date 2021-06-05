/*
 * API sub-router for users collection endpoints.
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
