const {getEndedAuctions} = require('../lib/getEndedAuctions')
const {closeAuction} = require('../lib/closeAuction')

const processAuctions = async() => {
    try{
        const auctionsToClose = await getEndedAuctions();
        const closePromises = auctionsToClose.map(auction => closeAuction(auction))
        await Promise.all(closePromises)
        return {
            closed: closePromises.length
        }
    }catch(error){
        throw new Error(error);
    }

}

exports.processAuctions = processAuctions