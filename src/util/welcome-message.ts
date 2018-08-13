const emoji = require('node-emoji');
const noEmoji = process.env.NO_EMOJI || false;
if (noEmoji === 'true' || noEmoji === true) emoji.get = () => '';


const printLine = () => {
    for (let i = 0; i < 56; i++) {
        process.stdout.write(emoji.get('fire') + ' ');
    }
    process.stdout.write('\n');
};

export const Welcome = () => {
    process.stdout.write('\n');
    printLine();
    console.log(require('figlet').textSync('Google Home Openstack'));
    printLine();
    process.stdout.write('\n');
};
