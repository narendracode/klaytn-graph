import * as common from '@klaytn-graph/common'
(async () => {
    setInterval(async () => {
        try {
            console.log(`API is running`)
            common.sayHello()
        } catch (error) {
            console.log(`Error encountered : ${error}`)
        }

    }, 5000) // every 20 seconds
})();