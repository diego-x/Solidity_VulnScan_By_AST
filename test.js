var parser=require("solidity-parser-antlr")
const ast_to_class = require("./core/ast_to_class")

var input = `
    contract test {
      function AirSwapToken(address _deployer, address _owner, uint256 _balance)
          Pausable() {
          transferOwnership(_owner);
          balances[_deployer] = totalSupply - _balance;
          balances[_owner] = _balance;
          Transfer(0x0, _deployer, totalSupply);
          Transfer(_deployer, _owner, _balance);
      }
    }
`
res = parser.parse(input, {"loc":true})

contracts = ast_to_class(res, input)

contract_function = contracts[0].functions[0]
console.log(contract_function.get_spots_link(contract_function.getSpotChain()))