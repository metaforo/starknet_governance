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

        // (proposal_id + address) -> voter_status
        voter_status_map: LegacyMap::<(u32, ContractAddress), u8>,
        // (proposal_id + address) -> proposal_option
        proposal_option_map: LegacyMap::<(u32, ContractAddress), u8>,
        // (proposal_id, option_id) -> count
        proposal_result: LegacyMap::<(u32, u8), u8>,
    }

    const VOTER_STATUS_NO_PERMISSION: u8 = 0_u8;
    const VOTER_STATUS_CAN_VOTE: u8 = 1_u8;
    const VOTER_STATUS_HAS_VOTED: u8 = 2_u8;

    #[constructor]
    fn constructor(owner: ContractAddress) {
        dao_owner::write(owner);
        proposal_id_generator::write(0_u32);
    }

    // #[view]
    // fn show_status(proposal_id: u32, voter: ContractAddress) -> u8 {
    //     proposal_option_map::read((proposal_id, voter))
    // }

    // #[view]
    // fn show_status_exist(proposal_id: u32, voter: ContractAddress) -> bool {
    //     proposal_option_map::have((proposal_id, voter))
    // }

    // #[external]
    // fn change_status(proposal_id: u32, voter: ContractAddress) {
    //     proposal_option_map::write((proposal_id, voter), 1);
    // }

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
    fn create_new_proposal(option_count: u8, metadata_url: felt252) -> u32 {
        // check user permission
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);

        // check parameter 
        assert(option_count > 1 & option_count < 100, 'OPTION_COUNT_SHOULD_IN_2_TO_99');

        // create new proposal
        let proposal_id = proposal_id_generator::read() + 1;
        proposal_id_generator::write(proposal_id);

        let new_proposal = Proposal {
            id: proposal_id, creator: caller, metadata_url: metadata_url, option_count: option_count
        };
        proposal_list::write(proposal_id, new_proposal);

        proposal_id
    }

    #[external]
    fn add_voter(proposal_id: u32, voter: ContractAddress) {
        // check user permission
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);
        // check voter not registered.
        // TODO: this line should be like `voter_status_map::contains(the_key)`, 
        // but I can not find the `contains` funciton.
        let current_voter_status = voter_status_map::read((proposal_id, voter));
        let voter_not_existed = current_voter_status != VOTER_STATUS_CAN_VOTE
            & current_voter_status != VOTER_STATUS_HAS_VOTED;
        assert(voter_not_existed, 'VOTER_EXISTED');

        voter_status_map::write((proposal_id, voter), VOTER_STATUS_CAN_VOTE);
    }

    #[external]
    fn delete_voter(proposal_id: u32, voter: ContractAddress) {
        // check user permission
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);

        let current_voter_status = voter_status_map::read((proposal_id, voter));
        assert(current_voter_status == VOTER_STATUS_HAS_VOTED, 'VOTER_ALREADY_VOTED');

        voter_status_map::write((proposal_id, voter), VOTER_STATUS_NO_PERMISSION);
    }

    #[external]
    fn start_proposal(proposal_id: u32) {
        // check user permission
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);
    // TODO: can not do `vote` before proposal start
    // TODO: can not do `add_voter` or `delete_voter` after proposal start
    }

    #[external]
    fn end_proposal(proposal_id: u32) {
        // check user permission
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);
    // TODO: can not do `vote` after proposal end
    }

    // endregion ---- Admin's Functions ----

    // region ---- Voter's Functions ----
    #[external]
    fn vote(proposal_id: u32, option_id: u8) {
        // check proposal existed && option is current
        let proposal: Proposal = proposal_list::read(proposal_id);
        assert(option_id > 0 & option_id <= proposal.option_count, 'WRONG_OPTION');

        // check voter permission
        let caller: ContractAddress = get_caller_address();
        _check_voter_permission(proposal_id, caller);

        // do vote
        voter_status_map::write((proposal_id, caller), VOTER_STATUS_HAS_VOTED);
        proposal_option_map::write((proposal_id, caller), option_id);
        let previous_count = proposal_result::read((proposal_id, option_id));
        proposal_result::write((proposal_id, option_id), previous_count + 1);
    }

    #[view]
    fn show_my_vote_history(proposal_id: u32) -> u8 {
        let caller: ContractAddress = get_caller_address();
        proposal_option_map::read((proposal_id, caller))
    }
    // endregion ---- Voter's Functions ----

    // region ---- Public Functions ----
    #[view]
    fn show_vote_result(proposal_id: u32) -> Array<u8> {
        let proposal: Proposal = proposal_list::read(proposal_id);
        let mut i: u8 = 1;
        let mut result = ArrayTrait::new();
        loop {
            result.append(proposal_result::read((proposal_id, i)));
            if i == proposal.option_count {
                break ();
            }
            i = i + 1;
        };
        result
    }
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

    fn _check_voter_permission(proposal_id: u32, address: ContractAddress) {
        let current_voter_status = voter_status_map::read((proposal_id, address));
        assert(current_voter_status != VOTER_STATUS_HAS_VOTED, 'HAS_VOTED');
        assert(current_voter_status == VOTER_STATUS_CAN_VOTE, 'NO_PERMISSION');
    }
}
