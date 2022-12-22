message Add {
    amount: Int as uint32;
}

trait Ownable {
    owner: Address;

    fun requireOwner() {
        nativeThrowUnless(132, context().sender == self.owner);
    }

    get fun owner(): Address {
        return self.owner;
    }
}

contract SampleTactContract with Ownable {
    counter: Int as uint32;
    owner: Address;

    init(owner: Address) {
        self.owner = owner;
        self.counter = 0;
    }

    fun add(v: Int) {
        // Check sender
        let ctx: Context = context();
        require(ctx.sender == self.owner);
        
        // Update counter
        self.counter = (self.counter + v);
    }

    receive(msg: Add) {
        self.add(msg.amount);
    }

    receive("increment") {
        self.add(1);
    }

    receive("dec") {
        self.counter = self.counter - 1;
    }

    get fun counter(): Int {
        return self.counter;
    }

    get fun balance(): Int {
        return myBalance();
    }
}