import { ChangeEvent, Dispatch, useState } from 'react';
import { getText } from '@/pages/api/lang';

interface usernameInput
{
	handleFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
	data: any;
	errormssage: string;
	dispatch: Dispatch<any>;
	info?: any;
}
const UsernameInput = ({ handleFormChange, data, errormssage, dispatch, info} : usernameInput) => {
  const [username, setUsername] = useState(info?.username);
  const [error, setError] = useState('');
  const error_user_alredy_exist = getText('USER_ALREADY_EXIST');
  const error_user_alphanumeric = getText('USER_ALPHANUMERIC')
  const error_user_max_charcter  = getText('USER_MAX_CHARACTER')


  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
	dispatch({type: "ERROR_MESSAGE", pyload: ""})
    if (value.length > 15) {
		setUsername(value.substring(0, 16));
		setError( error_user_max_charcter);
		dispatch({type: "ERROR_USER", pyload: false})
	  } else {
		let containsNonAlphanumeric = false;
		for (let i = 0; i < value.length; i++) {
		  const charCode = value.charCodeAt(i);
		  if (
			!(charCode >= 48 && charCode <= 57) && // 0-9
			!(charCode >= 65 && charCode <= 90) && // A-Z
			!(charCode >= 97 && charCode <= 122) // a-z
		  ) {
			containsNonAlphanumeric = true;
			break;
		  }
		}
  
		if (containsNonAlphanumeric) {
		  setUsername(value);
		  setError(error_user_alphanumeric);
			dispatch({type: "ERROR_USER", pyload: false})
		} else {
		  setUsername(value);
		  setError('');
			dispatch({type: "ERROR_USER", pyload: true})
		}
	  }
    handleFormChange(e);
  };

  return (
    <div className="ml-[30px]">
      <label
        htmlFor="one"
        className="text-[12px] font-sora font-[400] phone:text-[9px] Large-phone:text-[10px] laptop:text-[10px]"
      >
        {getText('USERNAME')}
		<span className='text-orange'> *</span>
      </label>
      <input
        id="one"
        onChange={handleUsernameChange}
        name="name"
        placeholder={data.username}
        type="text"
        value={username}
        className="w-[305px] h-[31px] text-[12px] border-current border-2 rounded-full p-[15px] phone:w-[200px] phone:h-[20px] phone:text-[10px] Large-phone:w-[220px] Large-phone:h-[40px] Large-phone:text-[10px] laptop:h-[40px] laptop:text-[15px]"
        required
        style={{ borderColor: !error ? 'black' : 'red' }}
      />
      {error && <p className="text-red-500 text-[10px] phone:text-[7px] Large-phone:text-[8px]">{error}</p>}
	  {errormssage && (
			<p className="text-red-500 text-[10px] phone:text-[7px] Large-phone:text-[8px]">{error_user_alredy_exist}</p>
			)}
    </div>
  );
};

export default UsernameInput;
