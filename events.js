const EventEmitter = require('events');

// Create an event emitter instance
class SlotEmitter extends EventEmitter {}

const slotEmitter = new SlotEmitter();

module.exports = slotEmitter;
