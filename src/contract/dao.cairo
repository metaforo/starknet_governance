#[contract]
mod Dao {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use array::ArrayTrait;
    use starknet_governance::contract::proposal::Proposal;

    struct Storage {
        // ----
        // Dao base info
        // ----

        // Can change admin list
        dao_owner: ContractAddress,
        dao_meta_info: felt252, // url 
        // who can create proposal.
        admin_list: LegacyMap::<ContractAddress, bool>,
        // Proposal Info
        proposal_id_generator: u32,
        proposal_list: LegacyMap::<u32, Proposal>,
        // ----
        // Proposal Option Info (Shoule move to Proposal struct if LegacyMap can be used in struct)
        // ----

        // anyone who has participated in any proposal. currently not available. 
        // After the proposal is finished, we can check the score of each option, 
        // but we cannot find out which addresses have voted for each option separately. 
        // Through all_voters, we can check which option each address has voted for (or not) 
        // for this proposal through proposal+voter_address, and then perform a statistics to 
        // obtain the result of option-> List<address>.
        // But this map consumes too much on-chain storage, so we plan to move this function offline.
        // all_voters: LegacyMap::<ContractAddress, bool>,

        // (proposal_id + address) -> proposal_status
        proposal_status_map: LegacyMap::<(u32, ContractAddress), u8>,
        // (proposal_id + address) -> proposal_option
        proposal_option_map: LegacyMap::<(u32, ContractAddress), u8>,
        // (proposal_id, option_id) -> count
        proposal_result: LegacyMap::<(u32, u32), u8>,
    }

    const PROPOSAL_STATUS_NO_PERMISSION: u8 = 0_u8;
    const PROPOSAL_STATUS_VOTE: u8 = 1_u8;
    const PROPOSAL_STATUS_HAS_VOTED: u8 = 2_u8;

    #[constructor]
    fn constructor(owner: ContractAddress) {
        dao_owner::write(owner);
        proposal_id_generator::write(0_u32);
    }


    // region ---- Owner's Functions ----
    #[external]
    fn add_admin(admin: ContractAddress) {
        let caller: ContractAddress = get_caller_address();
        _check_owner_permission(caller);

        admin_list::write(admin, true);
    }

    #[external]
    fn delete_admin(admin: ContractAddress) {
        let caller: ContractAddress = get_caller_address();
        _check_owner_permission(caller);

        admin_list::write(admin, false);
    }

    // endregion ---- Owner's Functions ----

    // region ---- Admin's Functions ----
    #[external]
    fn create_new_proposal(option_count: u8, metadata_url: felt252) {
        // check user permission
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);
        // check parameter 

        assert(option_count > 1 & option_count < 100, 'OPTION_COUNT_SHOULD_IN_2_TO_99');

        let proposal_id = proposal_id_generator::read() + 1;
        proposal_id_generator::write(proposal_id);

        let new_proposal = Proposal {
            id: proposal_id, creator: caller, metadata_url: metadata_url, option_count: option_count
        };
        proposal_list::write(proposal_id, new_proposal);
    }

    fn add_voter(proposal_id: u32, voter: ContractAddress) {}

    fn delete_voter(proposal_id: u32, voter: ContractAddress) {}

    fn start_proposal(proposal_id: u32) {}

    fn end_proposal(proposal_id: u32) {}

    // endregion ---- Admin's Functions ----

    // region ---- Voter's Functions ----
    fn vote(proposal_id: u32, option_id: u32) {}

    fn show_my_vote_history(proposal_id: u32) {}
    // endregion ---- Voter's Functions ----

    // region ---- Public Functions ----
    fn show_vote_result(proposal_id: u32) {} // (each option's count)
    // endregion ---- Public Functions ----

    // ----
    // internal
    // ----

    fn _check_owner_permission(address: ContractAddress) {
        let is_owner: bool = address == dao_owner::read();
        assert(is_owner, 'USER_NOT_OWNER');
    }

    fn _check_admin_permission(address: ContractAddress) {
        let is_admin: bool = admin_list::read(address);
        assert(is_admin, 'USER_NOT_ADMIN');
    }
}
