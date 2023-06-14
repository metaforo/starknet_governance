use array::ArrayTrait;
use debug::PrintTrait;
use result::ResultTrait;

#[test]
fn test_create_new_vote() {
    let mut init_calldata = ArrayTrait::new();
    init_calldata.append(0x01936DC82b6433E0bf62e3E3F310b522B090c23968feFf53dFcf9d0e012fF9E6);
    let contract_address = deploy_contract('vote_factory', @init_calldata).unwrap();
    contract_address.print();
}
