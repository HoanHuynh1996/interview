import { createLogger, format, transports, Logger } from 'winston';
import { TransformableInfo } from 'logform'; // Required for correct type

const logger: Logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'MM-DD-YYYY HH:mm:ss' }),
        format.align(),
        format.printf((info: TransformableInfo) =>
          `[${info.level.toUpperCase()}][${info.timestamp}]: ${info.message}`
        )
      ),
    }),
  ],
});

export default logger;