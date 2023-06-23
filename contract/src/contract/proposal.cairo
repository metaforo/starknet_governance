use starknet::{
    ContractAddress, StorageAccess, StorageBaseAddress, SyscallResult,
    contract_address_try_from_felt252, storage_address_from_base_and_offset, storage_read_syscall,
    storage_write_syscall,
};
use array::{ArrayTrait, SpanTrait};
use traits::{Into, TryInto};
use option::OptionTrait;
use box::BoxTrait;

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
        let creatorFelt = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 1_u8)
        )?;

        Result::Ok(
            Proposal {
                id: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 0_u8)
                )?
                    .try_into()
                    .expect('failed'),
                creator: contract_address_try_from_felt252(creatorFelt).expect('failed'),
                metadata_url1: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 2_u8)
                )?,
                metadata_url2: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 3_u8)
                )?,
                option_count: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 4_u8)
                )?
                    .try_into()
                    .expect('failed'),
                voting_end_block: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 5_u8)
                )?
                    .try_into()
                    .expect('failed'),
                voting_strategy: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 6_u8)
                )?
                    .try_into()
                    .expect('failed'),
            }
        )
    }

    #[inline(always)]
    fn write(address_domain: u32, base: StorageBaseAddress, value: Proposal) -> SyscallResult<()> {
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 0_u8), value.id.into()
        );
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 1_u8), value.creator.into()
        );
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 2_u8),
            value.metadata_url1.into()
        );
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 3_u8),
            value.metadata_url2.into()
        );
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 4_u8),
            value.option_count.into()
        );
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 5_u8),
            value.voting_end_block.into()
        );
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 6_u8),
            value.voting_strategy.into()
        )
    }
}
