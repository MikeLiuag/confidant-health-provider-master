import { RNS3 } from 'react-native-aws3';
import {S3_CLIENT_OPTIONS} from '../constants/CommonConstants';
let _instance;
class S3ManagerInstance {

    constructor() {
        if(_instance) {
            return _instance;
        }
        _instance = this;
    }

    uploadChatMedia=(file, onProgress)=> {
        return this.uploadToS3(file,'chatMedia/', onProgress)
    };

    uploadContactNotesMedia=(file,keyPrefix, onProgress)=> {
        return this.uploadToS3(file,keyPrefix, onProgress)
    };

    uploadDisplayPicture=(file, onProgress)=>{
        return this.uploadToS3(file,'displayPics/', onProgress)
    };

    uploadToS3=(file, keyPrefix, onProgress)=>{
        const options = {level: 'public',...S3_CLIENT_OPTIONS, keyPrefix};
        return RNS3.put(file, options)
            .progress((e)=>{
                console.log('Media uploading, Completed: ' + (e.percent * 100).toFixed() +"%");
                if(onProgress) {
                    onProgress(e);
                }
            }).then(response=>{
                return {
                    response: response.body.postResponse,
                    success: response.status===201
                };
            }).catch(err=>{
                console.log({"err":err})
                 console.log('Failed to upload media to s3 bucket');
                 console.log(err);
            });
    };
}
export const S3MediaManager = new S3ManagerInstance();
