#[contract]
mod Dao {
    use array::{ArrayTrait, SpanTrait};
    use box::BoxTrait;
    use option::OptionTrait;
    use starknet::{ContractAddress, contract_address_try_from_felt252, get_caller_address, };
    use starknet::info::{get_block_timestamp, get_block_number};
    use traits::{Into, TryInto};

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
        proposal_map: LegacyMap::<u32, Proposal>,
        // ----
        // Proposal Option Info (Shoule move to Proposal struct if LegacyMap can be used in struct)
        // ----

        // (address + metadata_url) -> proposal_id
        proposal_id_map: LegacyMap::<(ContractAddress, felt252, felt252), u32>,
        // (proposal_id + address) -> voter_status
        voter_status_map: LegacyMap::<(u32, ContractAddress), u8>,
        // (proposal_id + address) -> proposal_option
        proposal_option_map: LegacyMap::<(u32, ContractAddress), u8>,
        // (proposal_id, option_id) -> count
        proposal_result: LegacyMap::<(u32, u8), u8>,
        // proposal_id -> contract_address
        proposal_contract_address_config: LegacyMap::<u32, ContractAddress>,
        // proposal_id -> selector
        proposal_selector_config: LegacyMap::<u32, felt252>,
    }

    const VOTER_STATUS_NO_PERMISSION: u8 = 0_u8;
    const VOTER_STATUS_CAN_VOTE: u8 = 1_u8;
    const VOTER_STATUS_HAS_VOTED: u8 = 2_u8;

    const VOTING_STRATEGY_DEFAULT: u8 = 0_u8;
    const VOTING_STRATEGY_WHITE_LIST: u8 = 1_u8;
    const VOTING_STRATEGY_ERC_721: u8 = 2_u8;

    #[constructor]
    fn constructor(owner: ContractAddress) {
        dao_owner::write(owner);
        proposal_id_generator::write(0_u32);
        admin_list::write(owner, true);
    }

    // region ---- event ----

    #[event]
    fn NewProposalCreated(
        operator: ContractAddress, proposal_id: u32, metadata_url1: felt252, metadata_url2: felt252
    ) {}

    // endregion ---- event ----

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
    #[view]
    fn can_create_new_proposal(caller: ContractAddress) -> bool {
        let is_admin: bool = admin_list::read(caller);
        is_admin
    }

    #[external]
    fn create_new_proposal(
        option_count: u8,
        metadata_url1: felt252,
        metadata_url2: felt252,
        voting_end_block: u64,
        voter_list: Array<felt252>,
    ) -> u32 {
        // check params
        _check_create_vote_params(option_count, metadata_url1, metadata_url2, voting_end_block);
        // create new proposal
        let caller: ContractAddress = get_caller_address();
        let proposal_id = proposal_id_generator::read() + 1;
        proposal_id_generator::write(proposal_id);

        let new_proposal = Proposal {
            id: proposal_id,
            creator: caller,
            metadata_url1: metadata_url1,
            metadata_url2: metadata_url2,
            option_count: option_count,
            voting_end_block: voting_end_block,
            voting_strategy: VOTING_STRATEGY_WHITE_LIST,
        };

        proposal_map::write(proposal_id, new_proposal);
        proposal_id_map::write((caller, metadata_url1, metadata_url2), proposal_id);

        // save voter list
        let mut i: usize = 0;
        loop {
            if i >= voter_list.len() {
                break ();
            }
            let voter_felt252 = voter_list.get(i).unwrap().unbox();
            let voter = contract_address_try_from_felt252(*voter_felt252).unwrap();
            voter_status_map::write((proposal_id, voter), VOTER_STATUS_CAN_VOTE);
            i = i + 1;
        };

        NewProposalCreated(caller, proposal_id, metadata_url1, metadata_url2);

        proposal_id
    }

    #[external]
    fn create_new_proposal_nft(
        option_count: u8,
        metadata_url1: felt252,
        metadata_url2: felt252,
        voting_end_block: u64,
        contract_address: ContractAddress,
        selector: ContractAddress,
    ) -> u32 {
        // check params
        _check_create_vote_params(option_count, metadata_url1, metadata_url2, voting_end_block);
        // create new proposal
        let caller: ContractAddress = get_caller_address();
        let proposal_id = proposal_id_generator::read() + 1;
        proposal_id_generator::write(proposal_id);

        let new_proposal = Proposal {
            id: proposal_id,
            creator: caller,
            metadata_url1: metadata_url1,
            metadata_url2: metadata_url2,
            option_count: option_count,
            voting_end_block: voting_end_block,
            voting_strategy: VOTING_STRATEGY_ERC_721,
        };
        proposal_map::write(proposal_id, new_proposal);

        proposal_id_map::write((caller, metadata_url1, metadata_url2), proposal_id);
        proposal_contract_address_config::write(proposal_id, contract_address);
        proposal_selector_config::write(proposal_id, selector.into());

        NewProposalCreated(caller, proposal_id, metadata_url1, metadata_url2);

        proposal_id
    }

    #[view]
    fn get_proposal_id(
        caller: ContractAddress, metadata_url1: felt252, metadata_url2: felt252
    ) -> u32 {
        proposal_id_map::read((caller, metadata_url1, metadata_url2))
    }

    #[external]
    fn add_voter(proposal_id: u32, voter: ContractAddress) {
        // check user permission
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);
        // check voter not registered.
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

    // endregion ---- Admin's Functions ----

    // region ---- Voter's Functions ----
    #[external]
    fn vote(proposal_id: u32, option_id: u8) {
        // check proposal existed && option is current
        let proposal: Proposal = proposal_map::read(proposal_id);

        assert(option_id > 0 & option_id <= proposal.option_count, 'WRONG_OPTION');
        assert(!_proposal_closed(proposal_id), 'VOTE_CLOSED');

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
    fn show_vote_history(proposal_id: u32, address: ContractAddress) -> u8 {
        proposal_option_map::read((proposal_id, address))
    }
    // endregion ---- Voter's Functions ----

    // region ---- Public Functions ----

    #[view]
    fn get_proposal(proposal_id: u32) -> Array<felt252> {
        let proposal: Proposal = proposal_map::read(proposal_id);
        let mut result = ArrayTrait::<felt252>::new();

        result.append(proposal.id.into());
        result.append(proposal.creator.into());
        result.append(proposal.metadata_url1);
        result.append(proposal.metadata_url2);
        result.append(proposal.option_count.into());
        result.append(bool_to_felt252(_proposal_closed(proposal_id)));

        result
    }

    #[view]
    fn get_proposal_creator(proposal_id: u32) -> ContractAddress {
        let proposal: Proposal = proposal_map::read(proposal_id);
        proposal.creator
    }

    #[view]
    fn get_proposal_metadata(proposal_id: u32) -> Array<felt252> {
        let proposal: Proposal = proposal_map::read(proposal_id);
        let mut result = ArrayTrait::<felt252>::new();
        result.append(proposal.metadata_url1);
        result.append(proposal.metadata_url2);
        result
    }

    #[view]
    fn get_proposal_closed(proposal_id: u32) -> bool {
        _proposal_closed(proposal_id)
    }

    #[view]
    fn show_vote_result(proposal_id: u32) -> Array<u8> {
        let proposal: Proposal = proposal_map::read(proposal_id);
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

    #[view]
    fn show_block_timestamp() -> u64 {
        get_block_timestamp()
    }

    #[view]
    fn show_block_number() -> u64 {
        get_block_number()
    }

    // endregion ---- Public Functions ----

    // region ---- internal functions ----

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
        let proposal: Proposal = proposal_map::read(proposal_id);

        let voting_strategy = proposal.voting_strategy;
        if voting_strategy == VOTING_STRATEGY_ERC_721 {
            let contract_address = proposal_contract_address_config::read(proposal_id);
            let selector = proposal_selector_config::read(proposal_id);
            assert(_check_balance(address, contract_address, selector), 'NO_PERMISSION');
        } else {
            assert(current_voter_status == VOTER_STATUS_CAN_VOTE, 'NO_PERMISSION');
        }
    }

    fn _proposal_closed(proposal_id: u32) -> bool {
        let proposal: Proposal = proposal_map::read(proposal_id);

        let end_block = proposal.voting_end_block;
        let current_block = show_block_number();

        end_block > 0 & current_block > end_block
    }

    fn _check_balance(
        address: ContractAddress, contract: ContractAddress, selector: felt252
    ) -> bool {
        let mut calldata = ArrayTrait::new();
        calldata.append(address.into());

        let mut spanResult = starknet::call_contract_syscall(
            address: contract, entry_point_selector: selector, calldata: calldata.span(), 
        )
            .unwrap_syscall();
        let felt_result = *(spanResult.pop_front().unwrap());

        felt_result.into() > 0_u256
    }

    fn _check_create_vote_params(
        option_count: u8, metadata_url1: felt252, metadata_url2: felt252, voting_end_block: u64, 
    ) {
        let caller: ContractAddress = get_caller_address();
        _check_admin_permission(caller);

        // check parameter 
        assert(option_count > 1 & option_count < 100, 'OPTION_COUNT_SHOULD_IN_2_TO_99');

        let current_block = show_block_number();
        assert(voting_end_block > (current_block + 20), 'END_BLOCK_SIZE_ERROR');
    }
// endregion ---- internal functions ----
}
