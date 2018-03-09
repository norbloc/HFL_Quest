

 \      \   __________\______   \  |   ____   ____   \_____  \  __ __   ____   _______/  |_ 
 /   |   \ /  _ \_  __ \    |  _/  |  /  _ \_/ ___\   /  / \  \|  |  \_/ __ \ /  ___/\   __\
/    |    (  <_> )  | \/    |   \  |_(  <_> )  \___  /   \_/.  \  |  /\  ___/ \___ \  |  |  
\____|__  /\____/|__|  |______  /____/\____/ \___  > \_____\ \_/____/  \___  >____  > |__|  
        \/                    \/                 \/         \__>           \/     \/        


To complete the Quest a player is required to interact with the Fabric blockchain installed in the cloud.
To interact with the Fabric installation we have written a simple CLI client "quest".

## Getting Started

How to use CLI client "quest":

 $ node quest {query|invoke} chaincode_id function_name function_arg_1 ... function_arg_N
 
 This command "invoke"-s or "query"-es a specific function "function_name" from the chaincode "chaincode_id". This function may take some arguments, some functions take zero argumanets.
 
During the quest the player will:
 - learn how to interact with the Fabric blockchain - all interaction is through calling some chaincode functions.
 - learn how to use Fabric documenttaion;
 - learn the difference between "query" and "invoke" ways of calling a function from chaincode;
 - learn about "system" chaincodes;
 - have fun;
 - win a prize!

### Important note!

We use the single fabric channel with the name "myc".
Whenever the quest task requires to specify a channel name, use "myc"

### The hints

During the Quest the players will be given hints.
The hints will be added to this README file.
The players are supposed to do the "git pull" to update this file when a new hint is announced.

Hint0.5: To complete the first task you must _query_ _questfirst_ _getTheSecondTask_

 $ node quest query questfirst getTheSecondTask

Hint1: To complete task 2 you must refer to the Hyperledger Fabric documentation available online.  

Hint2: To request a block you have to find a name of the system chaincode which has functions for the task.

Hint3: [104,105,110,116,58,104,116,116,112,115,58,47,47,103,105,116,104,117,98,46,99,111,109,47,104,121,112,101,114,108,101,100,103,101,114,47,102,97,98,114,105,99,47,116,114,101,101,47,109,97,115,116,101,114,47,99,111,114,101,47,115,99,99,47,113,115,99,99]

Hint4:
  The id of the system chaincode is 'qscc'. The name of the function is 'GetBlockByNumber'
  
Hint5:
  The function GetBlockByNumber takes two arguments. The first is the channel name. The second is the block number.
  
Hint6:
  The function name fore task 3 is GetTransactionByID. CaSe MaTtErs!

### READY..

### STEADY ...

### GO!

First task:
Task1: Query the function getTheSecondTask from the chaincode with id "questfirst"
