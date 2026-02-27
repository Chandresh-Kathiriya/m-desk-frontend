import axios from 'axios';
import {
    UPLOAD_IMAGE_REQUEST,
    UPLOAD_IMAGE_SUCCESS,
    UPLOAD_IMAGE_FAIL,
} from '../../constants/admin/uploadConstants';

export const uploadBatchImages = (pendingImages: any[]) => async (dispatch: any, getState: any) => {
    try {
      dispatch({ type: UPLOAD_IMAGE_REQUEST });
  
      const { adminAuth: { adminInfo } } = getState();
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${adminInfo.token}` } };
  
      const uploadData = new FormData();
  
      // 1. Pack ALL images into a single request under the name 'images' (Plural!)
      pendingImages.forEach((img) => {
        uploadData.append('images', img.file); 
      });
  
      // 2. Send ONE request to the backend
      const { data } = await axios.post('/api/upload', uploadData, config);
  
      // 3. Map the returned Cloudinary URLs back to the colors/views you selected in the UI
      // (Because Multer processes arrays in order, index 0 of the files matches index 0 of the URLs!)
      const returnedUrls = data.imageUrls;
      
      const successfullyUploaded = returnedUrls.map((url: string, index: number) => ({
        url: url,
        color: pendingImages[index].color,
        view: pendingImages[index].view || ''
      }));
  
      // 4. Dispatch the final array to Redux
      dispatch({
        type: UPLOAD_IMAGE_SUCCESS,
        payload: successfullyUploaded, 
      });
  
    } catch (error: any) {
      dispatch({
        type: UPLOAD_IMAGE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };