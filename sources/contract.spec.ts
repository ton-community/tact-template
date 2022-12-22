import { toNano, Cell } from 'ton';
import { ContractExecutor, createExecutorFromCode } from 'ton-nodejs';
import { SampleTactContract, SampleTactContract_init } from './output/sample_SampleTactContract';
import { randomAddress } from './utils/randomAddress';
import BN from 'bn.js';

describe('contract', () => {
    let owner = randomAddress(0, 'some-owner');
    let nonOwner = randomAddress(0, 'some-non-owner');
    let init: {
        code: Cell
        data: Cell
    }
    let executor: ContractExecutor;
    let contract: SampleTactContract;
    
    beforeEach(async () => {
        init = await SampleTactContract_init(owner);
        executor = await createExecutorFromCode(init);
        contract = new SampleTactContract(executor);
    })
    
    it('should deploy correctly', async () => {
        // Check counter
        expect((await contract.getCounter()).toString()).toEqual('0');

        // Increment counter
        await contract.send({ amount: toNano(1), from: owner }, 'increment');

        // Check counter
        expect((await contract.getCounter()).toString()).toEqual('1');

        // Non-owner
        await expect(() => contract.send({ amount: toNano(1), from: nonOwner }, 'increment')).rejects.toThrowError('Access denied');
    });

    it('should get meaning of life', async() => {
        expect((await contract.getMeaningOfLife()).toString()).toEqual('42');
    })
    
    it('should increment counter', async() => {
        await contract.send(
            { amount: toNano(1), from: owner }, 
            {
                $$type: "Add", 
                amount: new BN(13)
            }
        );
        await contract.send({ amount: toNano(1), from: nonOwner }, 'dec');
        expect((await contract.getCounter()).toString()).toEqual('12');
    })
});