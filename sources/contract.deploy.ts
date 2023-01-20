import { beginCell, contractAddress, toNano, Address } from "ton";
import { testAddress } from "ton-emulator";
import { SampleTactContract, storeAdd } from "./output/sample_SampleTactContract";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";

(async () => {

    // Parameters
    let owner = Address.parse('kQDND6yHEzKB82ZGRn58aY9Tt_69Ie_uz73e2VuuJ3fVVcxf'); // Replace owner with your address
    let packed = beginCell().store(storeAdd({ $$type: 'Add', amount: 1n })).endCell(); // Replace if you want another message used
    let init = await SampleTactContract.init(owner);
    let address = contractAddress(0, init);
    let deployAmount = toNano('0.5');
    let testnet = true;

    // Do deploy
    printHeader('SampleTactContract');
    printAddress(address);

    await deploy(init, deployAmount, packed, testnet)
})();