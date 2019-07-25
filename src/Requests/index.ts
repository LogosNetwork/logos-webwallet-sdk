import AdjustFee, { AdjustFeeJSON } from './AdjustFee'
import AdjustUserStatus, { AdjustUserStatusJSON } from './AdjustUserStatus'
import Burn, { BurnJSON } from './Burn'
import ChangeSetting, { ChangeSettingJSON} from './ChangeSetting'
import Distribute, { DistributeJSON } from './Distribute'
import ImmuteSetting, { ImmuteSettingJSON } from './ImmuteSetting'
import Issuance, { IssuanceJSON } from './Issuance'
import IssueAdditional, {IssueAdditionalJSON } from './IssueAdditional'
import Revoke, { RevokeJSON } from './Revoke'
import Send, { SendJSON } from './Send'
import TokenSend, { TokenSendJSON } from './TokenSend'
import UpdateController, { UpdateControllerJSON } from './UpdateController'
import UpdateIssuerInfo, { UpdateIssuerInfoJSON } from './UpdateIssuerInfo'
import WithdrawFee, { WithdrawFeeJSON } from './WithdrawFee'
import WithdrawLogos, { WithdrawLogosJSON } from './WithdrawLogos'
import TokenRequest from './TokenRequest'
export {
    AdjustFee,
    AdjustUserStatus,
    Burn,
    ChangeSetting,
    Distribute,
    ImmuteSetting,
    Issuance,
    IssueAdditional,
    Revoke,
    Send,
    TokenSend,
    UpdateController,
    UpdateIssuerInfo,
    WithdrawFee,
    WithdrawLogos,
    TokenRequest
}
export type Request = Send|Issuance|TokenSend|IssueAdditional|ChangeSetting|ImmuteSetting|Revoke|AdjustUserStatus|AdjustFee|UpdateIssuerInfo|UpdateController|Burn|Distribute|WithdrawFee|WithdrawLogos
export type RequestJSON = SendJSON|IssuanceJSON|TokenSendJSON|IssueAdditionalJSON|ChangeSettingJSON|ImmuteSettingJSON|RevokeJSON|AdjustUserStatusJSON|AdjustFeeJSON|UpdateIssuerInfoJSON|UpdateControllerJSON|BurnJSON|DistributeJSON|WithdrawFeeJSON|WithdrawLogosJSON