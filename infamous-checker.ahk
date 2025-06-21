#Requires AutoHotkey v2.0
OnClipboardChange ClipChanged
ClipChanged(DataType) {
	clip := A_Clipboard
	If InStr(clip, "Rarity: "){
		If InStr(clip, '"Infamous"')
		{
			MsgBox "Potential Infamous Prefix"
		}
		Else If InStr(clip, '"of Infamy"')
		{
			MsgBox "Potential Infamous Suffix"
		}
	}
}