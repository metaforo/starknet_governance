use starknet::StorageAccess;
use starknet::SyscallResult;
use starknet::StorageBaseAddress;
use starknet::ContractAddress;
use array::ArrayTrait;

#[derive(Copy, Drop, storage_access::StorageAccess)]
struct Proposal {
    id: u32,
    creator: ContractAddress,
    metadata_url1: felt252,
    metadata_url2: felt252,
    option_count: u8,
    voting_end_block: u64,

    // 0 means default. 1 means white list. 2 means by erc721
    voting_strategy: u8,
}

impl StorageAccessProposal of StorageAccess<Proposal> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Proposal> {
        Result::Ok(
            Proposal {
                id: StorageAccess::<u32>::read(address_domain, base)?,
                creator: StorageAccess::<ContractAddress>::read(address_domain, base)?,
                metadata_url1: StorageAccess::<felt252>::read(address_domain, base)?,
                metadata_url2: StorageAccess::<felt252>::read(address_domain, base)?,
                option_count: StorageAccess::<u8>::read(address_domain, base)?,
                voting_end_block: StorageAccess::<u64>::read(address_domain, base)?,
                voting_strategy: StorageAccess::<u8>::read(address_domain, base)?,
            }
        )
    }

    #[inline(always)]
    fn write(address_domain: u32, base: StorageBaseAddress, value: Proposal) -> SyscallResult<()> {
        StorageAccess::<u32>::write(address_domain, base, value.id)?;
        StorageAccess::<ContractAddress>::write(address_domain, base, value.creator)?;
        StorageAccess::<felt252>::write(address_domain, base, value.metadata_url1)?;
        StorageAccess::<felt252>::write(address_domain, base, value.metadata_url2)?;
        StorageAccess::<u8>::write(address_domain, base, value.option_count)?;
        StorageAccess::<u64>::write(address_domain, base, value.voting_end_block)?;
        StorageAccess::<u8>::write(address_domain, base, value.voting_strategy)
    }
}
