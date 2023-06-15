use starknet::StorageAccess;
use starknet::SyscallResult;
use starknet::StorageBaseAddress;
use starknet::ContractAddress;
use array::ArrayTrait;

#[derive(Copy, Drop, storage_access::StorageAccess)]
struct Proposal {
    // immutable
    id: u32,
    creator: ContractAddress,
    metadata_url: felt252,
    option_count: u8,
    // voting_end_time: u32,
    // voting_strategy: u8,

    // // mutable
    // registered_Proposalr: LegacyMap::<ContractAddress, bool>,
    // // address -> option
    // Proposal_result: LegacyMap::<ContractAddress, u8>,
}

impl StorageAccessProposal of StorageAccess<Proposal> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Proposal> {
        Result::Ok(
            Proposal {
                id: StorageAccess::<u32>::read(address_domain, base)?,
                creator: StorageAccess::<ContractAddress>::read(address_domain, base)?,
                metadata_url: StorageAccess::<felt252>::read(address_domain, base)?,
                option_count: StorageAccess::<u8>::read(address_domain, base)?,
                // option_count: StorageAccess::<u8>::read(address_domain, base)?,
                // registered_Proposalr: StorageAccess::<LegacyMap<ContractAddress,
                // bool>>::read(address_domain, base)?,
                // Proposal_result: StorageAccess::<LegacyMap<ContractAddress,
                // u8>>::read(address_domain, base)?,
            }
        )
    }

    #[inline(always)]
    fn write(address_domain: u32, base: StorageBaseAddress, value: Proposal) -> SyscallResult<()> {
        StorageAccess::<u32>::write(address_domain, base, value.id)?;
        StorageAccess::<ContractAddress>::write(address_domain, base, value.creator)?;
        StorageAccess::<felt252>::write(address_domain, base, value.metadata_url)?;
        StorageAccess::<u8>::write(address_domain, base, value.option_count)
        // StorageAccess::<LegacyMap<ContractAddress,
        // bool>>::write(address_domain, base, value.option_count)?;
        // StorageAccess::<LegacyMap<ContractAddress,
        // u8>>::write(address_domain, base, value.option_count)
        // StorageAccess::<u8>::write(address_domain, base, value.option_count)
    }
}
