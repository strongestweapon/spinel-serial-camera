import { SerialPort, ReadlineParser,ByteLengthParser   } from 'serialport';
import fs from  'fs';
import { readFile, writeFile } from "fs";

const path = 'COM8';
const baudRate = 115200;
let port;

function connect(path, baudRate= 115200) {
    port = new SerialPort({path: path, baudRate: baudRate, buffersize: 1500});
    //const parser = port.pipe(new ByteLengthParser ({ length: 512 } ));

    port.on('open', () => {
        console.log('Port open');
        getSnapshot();
        // const a = Buffer.from([0x90,0xEB,0x01,0x40,0x04,0x00,0x00,0x02,0x05,0x05,0xc1,0xc2])
        // port.write(a);
        // console.log('capture write done',a);
    });

    port.on('error', function(err) {
        console.log(err);
    })

    // long data received in multiple times 
    port.on('readable', function () {
        const data = port.read();
        //if(data[3]==0x49){
            console.log('Readable Data:', data)
            console.log('length:', data.length);
        //}
    })


    // port.on('data', (data) => {
    //     //console.log('Return:', data);
    //     if (data[0] == 0x90  && data[1] ==0xeb){
            
    //         console.log('Return:', data);
    //         if(data[3] == 0x40) {
    //             imagesize = data[7] + data[8]*256 + data[9]*256*256 + data[10]*256*256*256;
    //             console.log('capture return:', data)
    //             console.log('image size:', imagesize);
                
    //             //getSnapshot();
    //         } else if (data[3] == 0x49) {
    //             console.log('image data:', data);
    //             try {
    //                 fs.writeFileSync('test.jpg', data);
    //                 console.log('File written successfully');
    //                 // file written successfully
    //               } catch (err) {
    //                 console.error(err);
    //               }
    //     }
    // }
    // });
}

let imagesize = 0;

function getSnapshot() {
    const a = Buffer.from([0x90,0xEB,0x01,0x40,0x04,0x00,0x00,0x02,0x05,0x05,0xc1,0xc2])
    port.write(a);
    console.log('capture write done',a);
}

// 8 + 512 = 520 bytes at a time
function downloadSnapshot() {
    let count = 0;
    const a = Buffer.from([0x90,0xEB,0x01,0x48,0x06,0x00])
    const c  = Buffer.from([0x00,0x02,0xc1,0xc2])
    let addressBuffer = Buffer.allocUnsafe(4);
    addressBuffer.writeInt32LE(512*count)
    //console.log('addressBuffer', addressBuffer)

    const cmd = Buffer.concat([a,addressBuffer,c])
    port.write(cmd);

    //console.log('download snapshot write done',cmd);

}

connect(path, baudRate)
setTimeout(downloadSnapshot, 1000)

