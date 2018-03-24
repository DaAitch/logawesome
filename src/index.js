
class Logger {

    static ERROR_USING_CLOSED_LOGGER = 'Do not work on closed logger. Did you forgot branching?';
    static loggerCount = 1;

    constructor(logSystem, context = {}) {
        this._target = {
            debug: false,
            closed: false,
            context
        };

        this._logSystem = logSystem;
    }

    set debug(debug) {
        this._target.debug = debug;
    }

    get debug() {
        return this._target.debug;
    }

    close() {
        this._target.closed = true;
    }

    get closed() {
        return this._target.closed;
    }

    get context() {
        return this._target.context;
    }

    set(...args) {
        this._checkOpen();

        if (args.length === 1 && typeof args[0] === 'object') {
            this._target.context = {
                ...this._target.context,
                ...args[0]
            };
        } else if (args.length === 2 && typeof args[0] === 'string') {
            this._target.context = {
                ...this._target.context,
                [args[0]]: args[1]
            };
        } else {
            throw new TypeError(`unknown calling convention`);
        }
    }

    log(...args) {
        this._checkOpen();
        this._logWithoutOpenCheck(...args);
    }

    _logWithoutOpenCheck(...args) {
        const logTimestamp = Date.now();
        this._logSystem.log(logTimestamp, this.context, ...args);
    }

    _checkOpen() {
        if (this._target.closed) {
            this._reportError(Logger.ERROR_USING_CLOSED_LOGGER);
        }
    }

    _reportError(message) {
        if (this._target.debug) {
            throw new Error(message);
        }

        this._logWithoutOpenCheck(this._logSystem.loggingErrorLevel, message);
    }

    branch() {
        const logger = new Logger(this.context);
        logger.debug = this.debug;

        return logger;
    }

    pass(loggerCb) {
        return (...args) => {
            const logger = this.clone();
            const result = loggerCb(logger)(...args);
            logger.close();
            
            return result;
        };
    
    }

    clone() {
        this._checkOpen();

        const logger = new Logger(this.context);
        logger.debug = this.debug;

        return logger;
    }
}



const LOG = () => {
    return loggerCb => {
        return (...args) => {
            const logger = new Logger();

            const result = loggerCb(logger)(...args);
            logger.close();

            return result;
        };
    };
};

export class LogSystem {
    constructor() {
        this.transformer = log => log;
        this.loggingErrorLevel = 'NOTICE';
        this.asyncLog = false;

        this.appenders = [];
    }

    addAppender(appender) {
        this.appenders.push(appender);
    }

    removeAppender(appender) {
        this.appenders = this.appenders.filter(a => a !== appender);
    }

    createLogger() {
        const logger = new Logger(this);

        const f = (levelTpls, ...levelPlaceholders) => (msgTpls, ...placeholders) => {
            logger.log(
                [levelTpls, levelPlaceholders],
                [msgTpls, placeholders]
            );
        };

        f.set = logger.set.bind(logger);
        f.log = logger.log.bind(logger);
        f.branch = logger.branch.bind(logger);
        f._close = logger.close.bind(logger);

        return f;
    }

    entry() {
        return loggerCb => {
            const logger = this.createLogger();
            const fn = loggerCb(logger);
            logger._close();

            return fn;
        };
    }

    log(...args) {
        const appenders = this.appenders;

        const appenderLogger = () => appenders.forEach(a => a(...args));

        if (this.asyncLog) {
            setTimeout(appenderLogger, 0);
        } else {
            appenderLogger();
        }
    }
}