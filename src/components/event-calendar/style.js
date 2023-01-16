// @flow
import { StyleSheet } from 'react-native'
import {Colors, CommonStyles, TextStyles} from "ch-mobile-shared";

const calendarHeight = 2400
const eventPaddingLeft = 4
const leftMargin = 75 - 1
const boxLeftMargin = 24 - 1

export const styleConstructor = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentStyle: {
    backgroundColor: '#F8FAFC',
    //height: calendarHeight + 10,
    paddingBottom: 40,
  },
  line: {
    position: 'absolute',
    left: leftMargin,
  },
  timeLabel: {
    position: 'absolute',
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.captionText,
    color: Colors.colors.lowContrast,
    paddingLeft: 24,
  },
  slotBoxWrapper: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    left: boxLeftMargin,
    width: '90%',
  },
  slotBoxSingle: {
    // marginVertical: 8,
    width: '100%',
  },
  slotBox: {
    height: '100%',
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    ...CommonStyles.styles.shadowBox,
  },
  slotBoxInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  slotBoxInfoWrap: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 0,
  },
  slotBoxInfoTimeWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '90%',
    // flexWrap: 'wrap',
  },
  slotBoxInfoTitle: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.linkTextM,
    color: Colors.colors.highContrast,
    marginBottom: 4,
  },
  slotBoxInfoTime: {
    ...TextStyles.mediaTexts.manropeMedium,
    ...TextStyles.mediaTexts.inputLabel,
    color: Colors.colors.mediumContrast,
    marginRight: 8,
  },
  statusWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  statusBox: {
    width: 8,
    height: 8,
    borderRadius: 30,
    marginRight: 8,
    backgroundColor: Colors.colors.lowContrast,
  },
  event: {
    position: 'absolute',
    backgroundColor: Colors.colors.screenBG,
    opacity: 0.8,
    borderColor: '#fff',
    borderWidth: 0,
    borderRadius: 5,
    paddingLeft: 4,
    minHeight: 25,
    flex: 1,
    paddingTop: 5,
    paddingBottom: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflow: 'hidden',

  },
});
