import UI from './UI';
import { connect} from '../../app';

export default connect(({ user, global, loading }) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
  isMobile: false
}), {
  handleMenuCollapse({dispatch, getState}, collapsed) {
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  },
  handleNoticeClear({dispatch, getState}, type) {
    message.success(`清空了${type}`);
    dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  },
  handleMenuClick({dispatch, getState}, { key }) {
    if (key === 'triggerError') {
      dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  },
  handleNoticeVisibleChange({dispatch, getState}, visible) {
    if (visible) {
      dispatch({
        type: 'global/fetchNotices',
      });
    }
  },
  fetchCurrent({dispatch, getState}, visible) {
    dispatch({
      type: 'user/fetchCurrent',
    });
  }
})(UI);
