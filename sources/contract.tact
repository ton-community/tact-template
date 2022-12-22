import "@stdlib/ownable";

message Add {
    amount: Int as uint32;
}

message Withdraw {
    amount: Int;
}

contract SampleTactContract with OwnableTransferable {
    counter: Int as uint32;
    owner: Address;

    init(owner: Address) {
        self.owner = owner;
        self.counter = 0;
    }

    fun add(v: Int) {
        self.requireOwner();
        
        // Update counter
        self.counter = (self.counter + v);
    }

    receive(msg: Add) {
        self.add(msg.amount);
    }

    receive(msg: Withdraw) {
        self.requireOwner();
        require(myBalance() > msg.amount);
        send(SendParameters{
            to: self.owner,
            value: msg.amount,
            bounce: false
        });
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

    get fun meaning_of_life(): Int {
        return 42;
    }
}