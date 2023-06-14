#[contract]
mod VoteFactory {
    use starknet::ContractAddress;
    use array::ArrayTrait;
    use starknet_governance::contract::vote::Vote;

    struct Storage {
        // Dao base info
        dao_owner: ContractAddress,
        dao_meta_info: felt252, // url 
        // Vote Info
        vote_id_generator: u256,
        vote_list: LegacyMap::<u256, Vote>,
    }

    //voter_1: ContractAddress, voter_2: ContractAddress
    #[constructor]
    fn constructor(voter_1: ContractAddress) {}

    #[external]
    fn create_new_vote(name: felt252) {}
}
