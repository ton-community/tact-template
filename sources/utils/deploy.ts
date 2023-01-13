import { beginCell, Cell, contractAddress, storeStateInit } from "ton-core";
import { prompt } from 'enquirer';
import open from 'open';
import base64url from "base64url";
import { printSeparator } from "./print";
import qs from 'qs';

function getLink(prefix: string, init: { code: Cell, data: Cell }, value: bigint, command: Cell | string, testnet: boolean) {
    // Resolve target address
    let to = contractAddress(0, init);

    // Resovle init
    let initStr = base64url(beginCell()
        .store(storeStateInit(init))
        .endCell()
        .toBoc({ idx: false }));

    let link: string;
    if (typeof command === 'string') {
        link = prefix + `transfer/` + to.toString({ testOnly: testnet }) + "?" + qs.stringify({
            text: command,
            amount: value.toString(10),
            init: initStr
        });
    } else {
        link = prefix + `transfer/` + to.toString({ testOnly: testnet }) + "?" + qs.stringify({
            text: "Deploy contract",
            amount: value.toString(10),
            init: initStr,
            bin: base64url(command.toBoc({ idx: false })),
        });
    }
    return link;
}

export function getTonhubLink(init: { code: Cell, data: Cell }, value: bigint, command: Cell | string, testnet: boolean) {
    return getLink(`https://${testnet ? 'test.' : ''}tonhub.com/`, init, value, command, testnet);
}

export function getTonkeeperLink(init: { code: Cell, data: Cell }, value: bigint, command: Cell | string, testnet: boolean) {
    return getLink(`https://app.tonkeeper.com/`, init, value, command, testnet);
}

export function getLocalLink(init: { code: Cell, data: Cell }, value: bigint, command: Cell | string, testnet: boolean) {
    return getLink(`ton://`, init, value, command, testnet);
}

export function get(init: { code: Cell, data: Cell }, value: bigint, command: Cell | string, testnet: boolean) {
    // Resolve target address
    let to = contractAddress(0, init);

    // Resovle init
    let initStr = base64url(beginCell()
        .store(storeStateInit(init))
        .endCell()
        .toBoc({ idx: false }));

    let link: string;
    if (typeof command === 'string') {
        link = `https://${testnet ? 'test.' : ''}tonhub.com/transfer/` + to.toString({ testOnly: testnet }) + "?" + qs.stringify({
            text: command,
            amount: value.toString(10),
            init: initStr
        });
    } else {
        link = `https://${testnet ? 'test.' : ''}tonhub.com/transfer/` + to.toString({ testOnly: testnet }) + "?" + qs.stringify({
            text: "Deploy contract",
            amount: value.toString(10),
            init: initStr,
            bin: base64url(command.toBoc({ idx: false })),
        });
    }
    return link;
}

export async function deploy(init: { code: Cell, data: Cell }, value: bigint, command: Cell | string, testnet: boolean = true) {
    let kind = (await prompt<{ kind: 'tonhub' | 'tonkeeper' | 'local' }>([{
        type: 'select',
        name: 'kind',
        message: 'Way to deploy',
        initial: 0,
        choices: [{
            message: 'Tonhub/Sandbox',
            name: 'tonhub'
        }, {
            message: 'Tonkeeper',
            name: 'tonkeeper'
        }, {
            message: 'Open local link',
            name: 'local'
        }]
    }])).kind;

    const qrcode = require('qrcode-terminal');

    // Show tonhub link
    if (kind === 'tonhub') {
        printSeparator();
        let l = getTonhubLink(init, value, command, testnet);
        qrcode.generate(l, {small: true}, function (qrcode : any) {
            console.log('QR code for Tonhub/Sandbox wallet:' )
            console.log(qrcode);
            console.log('* If QR is still too big, please run script from the terminal. (or make the font smaller)')
        });
        printSeparator();
        console.log("Deploy: " + l);
        return;
    }


    // Show tonkeeper link with QR
    if (kind === 'tonkeeper') {
        printSeparator();
        let l = getTonkeeperLink(init, value, command, testnet);
        qrcode.generate(l, {small: true}, function (qrcode : any) {
            console.log('QR code for Tonkeeper wallet:' )
            console.log(qrcode);
            console.log('* If QR is still too big, please run script from the terminal. (or make the font smaller)')
        });
        printSeparator();
        console.log("Deploy: " + l);
        return;
    }

    // Show tonkeeper link with QR
    if (kind === 'local') {

        // Create a link and display to the user
        let l = getLocalLink(init, value, command, testnet);
        printSeparator();
        qrcode.generate(l, {small: true}, function (qrcode : any) {
            console.log('QR code for TON wallet:' )
            console.log(qrcode);
            console.log('* If QR is still too big, please run script from the terminal. (or make the font smaller)')
        });

        printSeparator();
        console.log("Deploy: " + l);

        // Open link
        open(l);
        
        return;
    }
}