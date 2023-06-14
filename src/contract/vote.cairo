use starknet::StorageAccess;
use starknet::SyscallResult;
use starknet::StorageBaseAddress;

#[derive(Copy, Drop, storage_access::StorageAccess)]
struct Vote {
    id: u256,
    id2: u256,
}
impl StorageAccessVote of StorageAccess<Vote> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Vote> {
        Result::Ok(
            Vote {
                id: StorageAccess::<u256>::read(address_domain, base)?,
                id2: StorageAccess::<u256>::read(address_domain, base)?,
            }
        )
    }

    #[inline(always)]
    fn write(address_domain: u32, base: StorageBaseAddress, value: Vote) -> SyscallResult<()> {
        StorageAccess::<u256>::write(address_domain, base, value.id)?;
        StorageAccess::<u256>::write(address_domain, base, value.id2)
    }
}
