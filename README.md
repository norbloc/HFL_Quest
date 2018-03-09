

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

Hint1: To complete task 2 you must refer to the Hyperledger Fabric documentation available online. 

### READY..

### STEADY ...

### GO!

First task:
Task1: Query the function getTheSecondTask from the chaincode with id "questfirst"
