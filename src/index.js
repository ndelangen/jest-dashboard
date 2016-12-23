const blessed = require('blessed');
const observer = require('jest-observer');
const path = require('path');

const screen = blessed.screen();
const body = blessed.box({
  top: 3,
  left: 0,
  width: '100%',
  height: '40%',
  scrollable: true
});
const debug = blessed.box({
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

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

function topOutput(text) { statusbar.setContent(text);}
function jestOutput(text) {

/*
add text to body
execute replacements
 */

  const sections = text.split(/\033/);
  const hasCommands = sections.length > 1;
  const isCommand = (string => string.match(/\[2J|\[3J|\[H|\[K|\[1A|\[999D/));
  const executeCommand = (command, body) => {
    switch (command) {
      case '[2J':
      case '[3J':
      case '[H': {
        debug.insertBottom('H EXECUTED');
        return body.setContent('');
      }
      case '[999D':
      case '[K': {
        const l = body.getLines().length - 1;
        debug.insertBottom('K EXECUTED');
        return body.clearLine(l);
      }
      case '[1A': {
        const l = body.getLines().length - 1;
        debug.insertBottom('A EXECUTED');
        return (l === 0) ? body.clearLine(l) : body.deleteLine(l);
      }
      default: {
        return debug.insertBottom('COMMAND NOT EXECUTED ' + command + ' !')
      }
    }
    // part = part.replace(/\[2J/g, () => {
    //   body.setContent('');
    //   return '';
    // });
    // part = part.replace(/\[3J/g, () => {
    //   body.setContent('');
    //   return '';
    // });
    // part = part.replace(/\[H/g, () => {
    //   body.setContent('');
    //   return '';
    // });
    // part = part.replace(/\[([0-9]*)D/g, (match, count) => {
    //   const l = body.getLines().length - 1;
    //   body.clearLine(l);
    //   return '<<<';
    // });
    // part = part.replace(/\[K/g, () => {
    //   const l = body.getLines().length - 1;
    //   body.clearLine(l);
    //   return '<<<';
    // });
    // part = part.replace(/\[1A/g, () => {
    //   const l = body.getLines().length - 1;
    //   if (l === 0) {
    //     body.clearLine(l);
    //   } else {
    //     body.deleteLine(l);
    //   }
    //   return 'uuu';
    // });
    //
    // // part = part.replace(/uuu(\n|\r|\f){0,1}/g, '');
    // part = part.replace(/<<<(\n|\r|\f){0,1}/g, '');
    // part = part.replace(/\n/g, '\n');
    // part = part.replace(/\r/g, '');
    // part = part.replace(/\f/g, '');

    // part = part.replace(/\033\[([0-9]*)A/g, (match, count) => {
    //   let i = parseInt(count, 10);
    //   while (i !== 0) {
    //     i--;
    //     // body.deleteBottom();
    //   }
    //   return '';
    // });
  };

  text = text.replace(/(\n)*$/g, '');
  text = text.replace(/\r/g, '');
  text = text.replace(/\u2028/g, '');
  text = text.replace(/\u2028/g, '');
  text = text.replace(/\u2029/g, '');


  if (hasCommands) {
    sections.forEach((part) => {
      if (isCommand(part)) {
        part = part.trim().replace(/\n/g, '');
        debug.insertBottom('command ' + part + ' !');
        executeCommand(part, body);
      } else {
        body.setContent(body.getContent() + '\033' + part);
      }
    });
  } else {
    // debug.insertBottom('Hey ' + text + ' you')
    body.setContent(body.getContent() + text);
  }



  //
  // // body.setContent(body.getContent() + part);
  // //
  // if (part.length) {
  //   part.split(/\n/g).map(l => l.length ? body.insertBottom(l) : null);
  //   // body.setContent(part.split('').join(''));
  //   // body.insertBottom(part);
  // } else {
  //   // deliberate empty line
  //   body.insertBottom('');
  // }
}
setInterval(function() {
  topOutput((new Date()).toISOString());
  screen.render();
}, 30);

var runner = observer({
  config: path.join(__dirname, '../demo/.jestrc')
}, () => {});

runner.on('data', (data) => {
  jestOutput(data.toString('utf8'));
});
