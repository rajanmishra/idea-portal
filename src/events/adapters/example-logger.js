'use strict';

const EventHandleAdapter = require('../handle-adapter');
const { ExampleFailEvent, ExampleSuccessEvent } = require('../types');

module.exports = async (container) => {
  const handle = async (message) => {
    // this logger is not scoped! no requestId at all.
    const { logger } = container;

    logger.info(message);
  };

  return new EventHandleAdapter({
    [ExampleFailEvent]: async ({ message }) => (
      handle(`[example fail event] ${message}`)
    ),

    [ExampleSuccessEvent]: async ({ customId, customDetail }) => (
      handle(`[example success event] ${customId} => ${customDetail}`)
    ),

    // optional default handler.
    [EventHandleAdapter.defaultSymbol]: async (event) => (
      handle(`[default handler] ${event.constructor.name}`)
    ),
  });
};
