import { test } from 'ava';
import sinon from 'sinon';

import { LogSystem } from '../src';

const later = () => new Promise((resolve, reject) => {
    setTimeout(resolve, 100);
});

let logSystem, appenderSpy;

test.beforeEach(() => {
    appenderSpy = sinon.spy();
    logSystem = new LogSystem();
    logSystem.addAppender(appenderSpy);
});

test('should log with log level and context', t => {

    const LOG = logSystem.createLogger('entry name');

    LOG.set('key1', 'value1');
    LOG.set({key2: 'value2', key3: 'value3'});

    LOG `DEBUG` `debug message`;
    t.true(appenderSpy.calledOnceWith(
        'entry name',
        {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
        },
        [['DEBUG'], []],
        [['debug message'], []]
    ));
});

test('', t => {
    const LOG = logSystem.createLogger('E');

    LOG({obj: 3}) `DEBUG` `test`;
    LOG `INFO` ``;
});

// test('', async t => {

//     const LOG = logSystem.createLogger('test2');

//     const rest = logSystem.entry('get customer')(LOG => async customerId => {
//         LOG.set({customerId});
//         LOG `DEBUG` `find customer in db`;
    
//         LOG = LOG.branch();
//         await later();

//         LOG `DEBUG` `found customer ${{customer: {
//             firstName: 'Max',
//             lastName: 'Mustermann'
//         }}}`;

//         setTimeout(LOG.pass(LOG => () => {
//             LOG.set('async', true);

//             LOG `DEBUG` `hi`;
//         }, 0));
//     });

//     LOG `DEBUG` `before rest`;
//     await rest('12345');
//     LOG `DEBUG` `after rest`;
// });

// test('should', async t => {
//     const rest = LOG('get customer')(logger => async customerId => {
//         logger.set({customerId});
    
//         logger.debug('find customer in db');
    
//         logger.branch();
//         await later();

//         logger.debug('found customer', {customer: {
//             firstName: 'Max',
//             lastName: 'Mustermann'
//         }});

//         setTimeout(logger.pass(logger => () => {
//             logger.set('async', true);
//             logger.debug('hi');
//         }, 0));
//     });

//     rest('12345');
// });


