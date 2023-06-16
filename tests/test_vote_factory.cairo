use array::ArrayTrait;
use debug::PrintTrait;
use result::ResultTrait;
use starknet::get_caller_address;
use starknet::contract_address_to_felt252;

#[test]
fn test_create_new_vote() {
    let mut init_calldata = ArrayTrait::new();
    init_calldata.append(0x0000000000000000000000000000000000000000000000000000000000000000);
    let contract_address = deploy_contract('dao', @init_calldata).unwrap();
    contract_address.print();

    let invoke_result = call(contract_address, 'create_new_proposal', @ArrayTrait::new());
    assert(invoke_result.is_err(), 'create new vote should failed');
    // get_caller_address().print();
    let mut add_admin_calldata = ArrayTrait::new();
    add_admin_calldata.append(0x0000000000000000000000000000000000000000000000000000000000000000);
    call(contract_address, 'add_admin', @add_admin_calldata);
// let invoke_result_after = call(contract_address, 'create_new_vote', @ArrayTrait::new());
// assert(invoke_result_after.is_ok(), 'create new vote should success');
}

// #[test]
// fn test_status() {
//     let mut init_calldata = ArrayTrait::new();
//     init_calldata.append(0x0000000000000000000000000000000000000000000000000000000000000000);
//     let contract_address = deploy_contract('dao', @init_calldata).unwrap();
//     contract_address.print();

//     let mut calldata = ArrayTrait::<felt252>::new();
//     calldata.append(111);
//     calldata.append(0x0000000000000000000000000000000000000000000000000000000000000000);
//     let invoke_result = call(contract_address, 'show_status_exist', @calldata);
//     invoke_result.is_ok().print();
//     invoke_result.unwrap().print();

//     let invoke_result_2 = call(contract_address, 'change_status', @calldata);
//     invoke_result_2.unwrap.print();
// }
