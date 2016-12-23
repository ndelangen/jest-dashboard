const blessed = require('blessed');
const observer = require('jest-observer');
const path = require('path');

const cwd = process.cwd();

const screen = blessed.screen({
  terminal: 'xterm-256color',
  smartCSR: true,
  useBCE: true,
  cursor: {
    artificial: true,
    blink: true,
    shape: 'underline'
  },
  log: `${__dirname}/../.log/jest-dashboard.log`,
  debug: true,
  dockBorders: true
});
const body = blessed.terminal({
  terminal: 'xterm-256color',
  cwd: cwd,
  // shell: 'npm',
  // args: ['-v'],
  top: 2,
  left: 0,
  width: 80,
  height: 80,
  scrollable: true
});
const debug = blessed.log({
  top: 43,
  left: 0,
  width: '100%',
  height: '50%',
  style: {
    fg: 'blue',
    bg: 'white'
  },
  scrollable: true
});
const statusbar = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 1,
  style: {
    fg: 'white',
    bg: 'blue'
  }
});

screen.append(statusbar);
screen.append(body);
screen.append(debug);

// debug.insertBottom('Hey: ' + JSON.stringify(body.pty.socket));
body.pty.write('cd ' + cwd +'\r');
body.pty.write('npm run test -- --watch\r');
// debug.insertBottom(body.screenshot([0,10,0,10]));

// body.pty.on('data', function(data) {
  // debug.insertBottom('data!: ' + data);
  // debug.insertBottom('screenshot!: ' + body.screenshot([0,10,0,10]));
// });

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.key(['a', 'o'], function(ch, key) {
  body.pty.write(ch);
});

function topOutput(text) { statusbar.setContent(text);}
// function jestOutput(text) {
//   const sections = text.split(/\033/);
//   const hasCommands = sections.length > 1;
//   const isCommand = (string => string.match(/\[2J|\[3J|\[H|\[K|\[1A|\[999D/));
//   const executeCommand = (command, body) => {
//     switch (command) {
//       case '[2J':
//       case '[3J':
//       case '[H': {
//         debug.insertBottom('H EXECUTED');
//         return body.setContent('');
//       }
//       case '[999D':
//       case '[K': {
//         const l = body.getLines().length - 1;
//         debug.insertBottom('K EXECUTED');
//         return body.clearLine(l);
//       }
//       case '[1A': {
//         const l = body.getLines().length - 1;
//         debug.insertBottom('A EXECUTED');
//         return (l === 0) ? body.clearLine(l) : body.deleteLine(l);
//       }
//       default: {
//         return debug.insertBottom('COMMAND NOT EXECUTED ' + command + ' !')
//       }
//     }
//   };
//
//   text = text.replace(/(\n)*$/g, '');
//   text = text.replace(/\r/g, '');
//   text = text.replace(/\u2028/g, '');
//   text = text.replace(/\u2028/g, '');
//   text = text.replace(/\u2029/g, '');
//
//
//   if (hasCommands) {
//     sections.forEach((part) => {
//       if (isCommand(part)) {
//         part = part.trim();
//         debug.insertBottom('command ' + part + ' !');
//         executeCommand(part, body);
//       } else {
//         body.setContent(body.getContent() + '\033' + part);
//       }
//     });
//   } else {
//     body.setContent(body.getContent() + text);
//   }
// }
setInterval(function() {
  topOutput((new Date()).toISOString());
  screen.render();
}, 30);

// var runner = observer({
//   config: path.join(__dirname, '../demo/.jestrc')
// }, () => {});
//
// runner.on('data', (data) => {
//   jestOutput(data.toString('utf8'));
// });
