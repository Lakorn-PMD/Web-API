const router = require('express').Router();

// Schema 
const seatSchema = require('../models/seat');
const ticketSchema = require('../models/ticket');

router.get('/', async (req, res) => {
    if (req.query.name) {
        try {
            const fetchData = await seatSchema.findOne({ name: req.query.name }).exec();
            res.send(fetchData);
        } catch (e) {
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    } else {
        try {
            const fetchData = await seatSchema.find({}, 'name').exec();
            res.send(fetchData);
        } catch (e) {
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    }
});

router.post('/create/:name', async (req, res) => {
    const { seatZone } = req.body;
    const { name } = req.params;

    if (!seatZone) {
        return res.status(404).json({ status: false, message: 'Data missing' });
    }

    seatZone.forEach((zone) => {
        zone.cells.sort((a, b) => {
            if (a.row === b.row) {
                return a.col - b.col;
            }
            return a.row - b.row;
        });
    });

    const newRoom = new seatSchema({ name, seatDetails: seatZone });
    await newRoom.save();

    res.json({ message: 'ok' });
});

router.post('/reserved', async (req, res) => {
    const body = req.body;
    body.seat.forEach(async (seat) => {
        try {
            const filter = {
                name: body.name,
                'seatDetails.zone': seat.zone,
            };

            const update = {
                $set: {
                    'seatDetails.$[zoneElem].cells.$[cellElem].isSold': true,
                },
            };

            const arrayFilters = [
                { 'zoneElem.zone': seat.zone },
                { 'cellElem.alphabetID': seat.seat },
            ];

            const result = await seatSchema.updateOne(filter, update, { arrayFilters });

            if (result.nModified > 0) {
                console.log(`Updated isSold for seat ${seat.zone}-${seat.seat}`);
            } else {
                console.log(`Seat ${seat.zone}-${seat.seat} not found.`);
            }
        } catch (error) {
            console.error(`Error updating isSold for seat ${seat.zone}-${seat.seat}: ${error}`);
        }
    });
    // req.io.emit('requestUpdateSeat', { status: true })
    res.send('ok')
})

module.exports = router;