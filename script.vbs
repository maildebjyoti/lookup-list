'DOS Command
'C:\Users\debjyotiacharjee\OneDrive - The Hong Kong Jockey Club\Download>del "i. RPT - Release Pipeline.xlsx" && copy "i.RPT - Release Pipeline - Copy.xlsx" "i. RPT - Release Pipeline.xlsx"


' Create an Excel Application
Dim xlApp, wbSource, wbLookup, wsLookup
Set xlApp = CreateObject("Excel.Application")

' Open the lookup workbook
Set wbLookup = xlApp.Workbooks.Open("C:\Users\debjyotiacharjee\OneDrive - The Hong Kong Jockey Club\Download\System information Management.xlsx")
Set wsLookup = wbLookup.Worksheets("System information Management")

' Specify the file path of Workbook2.xlsx
filePath = "C:\Users\debjyotiacharjee\OneDrive - The Hong Kong Jockey Club\Download\i. RPT - Release Pipeline.xlsx"

' Open Workbook2
On Error Resume Next
Set wbSource = xlApp.Workbooks.Open(filePath)

If wbSource Is Nothing Then
	MsgBox "Could not open External File. Please check the file path."
	WScript.Quit
End If

' Perform transformations on Workbook2
With wbSource.Sheets(1)

	Dim i, cellValue, transformedValue, cellValueLeadPortfolio, cellValuePortfolio

	' Set Headers
	.Cells(1, 24).Value = "Systems Involved" ' Systems Involved - Column X/24
	.Cells(1, 25).Value = "Criticality" ' Criticality - Column Y/25
	.Cells(1, 26).Value = "Is Criticality" ' Is Critical - Column Z/26
	.Cells(1, 27).Value = "Asset Health" ' Asset Health - Column AA/27
	.Cells(1, 28).Value = "Is Customer Facing" ' Is Customer Facing - Column AB/28
	.Cells(1, 29).Value = "Is Media Facing" ' Is Media Facing - Column AC/29

	' ' Copy formatting from A1 to headers
	' Dim headerRange
	' Set headerRange = .Range(.Cells(1, 1), .Cells(1, 1)) ' Reference the header cell A1

	' ' Apply the format from A1 to the new headers
	' headerRange.Copy
	' .Cells(1, 24).PasteSpecial -4163 ' xlPasteFormats
	' .Cells(1, 25).PasteSpecial -4163
	' .Cells(1, 26).PasteSpecial -4163
	' .Cells(1, 27).PasteSpecial -4163
	' .Cells(1, 28).PasteSpecial -4163
	' .Cells(1, 29).PasteSpecial -4163

	' Clear the clipboard to free up memory
	Application.CutCopyMode = False

	' Initialize row counter
	i = 2 ' Start from the second row

	' While loop to process rows based on the condition in column H
	While i > 0 And Not IsEmpty(.Cells(i, 8).Value) ' Column H is the 8th column

		' Project Link - Extract Project Code & Set Color - Column G/7
		cellValue = .Cells(i, 7).Value
		transformedValue = helperExtractPrjCode(cellValue)
		.Cells(i, 7).Value = transformedValue

		' Set font color (using RGB)
		Call SetFontColor(.Cells(i, 7), transformedValue)

		' Portfolio - Column C/3
		transformedValue = ""
		cellValueLeadPortfolio = .Cells(i, 2).Value
		cellValuePortfolio = .Cells(i, 3).Value
		If cellValueLeadPortfolio <> "" Then
			transformedValue = Trim(cellValueLeadPortfolio)
		ElseIf cellValuePortfolio = "<Portfolio Name>" Or cellValuePortfolio = "" Then
			transformedValue = "BLANK-ERROR"
			.Cells(i, 2).Interior.Color = &HFFCCCB ' Red color
			.Cells(i, 3).Interior.Color = &HFFCCCB
		Else
			transformedValue = Trim(cellValuePortfolio)
			.Cells(i, 2).Interior.Color = &HCCFF99 ' Light green
		End If
		.Cells(i, 2).Value = transformedValue ' Lead IT Portfolio
		.Cells(i, 3).Value = transformedValue ' Portfolio

		' Individual or Major Release - Column D/4
		cellValue = .Cells(i, 4).Value
		If cellValue = "" Then
			.Cells(i, 4).Value = "Individual Release"
			.Cells(i, 4).Interior.Color = &HCCFF99 ' Light green
		End If

		' Systems Involved - Column X/24
		cellValue = .Cells(i, 10).Value
		transformedValue = helperSplitText(cellValue)
		.Cells(i, 24).Value = transformedValue
		.Cells(i, 24).Font.Name = "Consolas"
		.Cells(i, 24).Font.Size = 9
		.Cells(i, 24).Interior.Color = &HFFCCCB ' Red color

		' Criticality - Column Y/25
		cellValue = .Cells(i, 10).Value
		transformedValue = helperGetCriticality(cellValue, wsLookup)
		.Cells(i, 25).Value = transformedValue
		.Cells(i, 25).Font.Name = "Consolas"
		.Cells(i, 25).Font.Size = 9
		.Cells(i, 25).Interior.Color = &HCCFF99 ' Light green

		If InStr(1, transformedValue, "Error", vbTextCompare) > 0 Then
			.Cells(i, 25).Interior.Color = &HFFCCCB ' Red color
		End If

		' Is Critical - Column Z/26
		transformedValue = helperIsCritical(transformedValue)
		.Cells(i, 26).Value = transformedValue
		If transformedValue Then
			.Cells(i, 26).Interior.Color = &HFFCCCB ' Red color
		End If

		' Asset Health - Column AA/27
		cellValue = .Cells(i, 10).Value
		transformedValue = helperGetAssetHealth(cellValue, wsLookup)
		.Cells(i, 27).Value = transformedValue
		.Cells(i, 27).Font.Name = "Consolas"
		.Cells(i, 27).Font.Size = 9
		.Cells(i, 27).Interior.Color = &HCCFF99 ' Light green

		If InStr(1, transformedValue, "Error", vbTextCompare) > 0 Then
			.Cells(i, 27).Interior.Color = &HFFCCCB ' Red color
		End If

		' Is Customer Facing - Column AB/28
		.Cells(i, 28).Value = helperIsCustomerFacing(transformedValue)
		If .Cells(i, 28).Value Then
			.Cells(i, 28).Interior.Color = &HFFCCCB ' Red color
		End If

		' Is Media Facing - Column AC/29
		.Cells(i, 29).Value = helperIsMediaFacing(transformedValue)
		If .Cells(i, 29).Value Then
			.Cells(i, 29).Interior.Color = &HFFCCCB ' Red color
		End If

		i = i + 1
	Wend

	' Delete the last 3 rows if necessary
	If i <= .Rows.Count Then
		.Rows(i & ":" & i + 2).Delete
	End If
End With

' Save and close Workbook
wbSource.Save
wbSource.Close False

' Clean up
wbLookup.Close False
Set wbSource = Nothing
Set wbLookup = Nothing
Set wsLookup = Nothing
xlApp.Quit
Set xlApp = Nothing

MsgBox "Transformation completed successfully!"

' Helper Functions
Function helperGetCriticality(cellValue, wsLookup)
	Dim splitValues, resultValues, i, foundCell
	splitValues = Split(cellValue, ",")
	resultValues = ""

	For i = LBound(splitValues) To UBound(splitValues)
		currentValue = Trim(splitValues(i))
		Set foundCell = wsLookup.Columns("B").Find(currentValue, , 1, 1) ' LookIn:=xlValues, LookAt:=xlWhole

		If Not foundCell Is Nothing Then
			resultValues = resultValues & helperPadWithSpaces(currentValue, 10) & " : " & Trim(wsLookup.Cells(foundCell.Row, "D").Value) & vbCrLf
		Else
			resultValues = resultValues & helperPadWithSpaces("Error", 10) & " : " & currentValue & vbCrLf
		End If
	Next

	If Len(resultValues) > 0 Then
		resultValues = Left(resultValues, Len(resultValues) - 2)
	End If

	helperGetCriticality = resultValues
End Function

Function helperGetAssetHealth(cellValue, wsLookup)
	Dim splitValues, resultValues, i, foundCell
	splitValues = Split(cellValue, ",")
	resultValues = ""

	For i = LBound(splitValues) To UBound(splitValues)
		currentValue = Trim(splitValues(i))
		Set foundCell = wsLookup.Columns("B").Find(currentValue, , 1, 1) ' LookIn:=xlValues, LookAt:=xlWhole

		If Not foundCell Is Nothing Then
			resultValues = resultValues & helperPadWithSpaces(currentValue, 10) & " : " & Trim(wsLookup.Cells(foundCell.Row, "C").Value) & vbCrLf
		Else
			resultValues = resultValues & helperPadWithSpaces("Error", 10) & " : " & currentValue & vbCrLf
		End If
	Next

	If Len(resultValues) > 0 Then
		resultValues = Left(resultValues, Len(resultValues) - 2)
	End If

	helperGetAssetHealth = resultValues
End Function

Function helperPadWithSpaces(str, length)
	If Len(str) < length Then
		helperPadWithSpaces = str & Space(length - Len(str))
	Else
		helperPadWithSpaces = Left(str, length) ' Truncate if longer than specified length
	End If
End Function

Function helperSplitText(cellValue)
	Dim splitValues, resultValues, i
	splitValues = Split(cellValue, ",")
	resultValues = ""

	For i = LBound(splitValues) To UBound(splitValues)
		currentValue = Trim(splitValues(i))
		resultValues = resultValues & currentValue & ", " & vbCrLf
	Next

	helperSplitText = resultValues
End Function

Function helperCheckPrjCode(inputString)
	If inputString = "" Then
		helperCheckPrjCode = True
		Exit Function
	End If

	helperCheckPrjCode = (InStr(1, inputString, "prj", vbTextCompare) = 0) Or _
						 (InStr(1, inputString, "prjprj", vbTextCompare) > 0) Or _
						 (InStr(1, inputString, "xxx", vbTextCompare) > 0) Or _
						 (InStr(1, inputString, "tbd", vbTextCompare) > 0)
End Function

Function helperIsCritical(inputString)
	helperIsCritical = (InStr(1, inputString, "Lifeblood", vbTextCompare) > 0) Or _
					   (InStr(1, inputString, "Critical", vbTextCompare) > 0)
End Function

Function helperIsCustomerFacing(inputString)
	helperIsCustomerFacing = (InStr(1, inputString, "Customer Facing", vbTextCompare) > 0)
End Function

Function helperIsMediaFacing(inputString)
	helperIsMediaFacing = (InStr(1, inputString, "Media Facing", vbTextCompare) > 0)
End Function

Function helperExtractPrjCode(cellValue)
	Dim startPos, endPos, separatorPos
	separatorPos = InStr(cellValue, "|")

	If separatorPos = 0 Then
		helperExtractPrjCode = cellValue
	Else
		startPos = InStr(cellValue, "[")
		If startPos > 0 Then
			endPos = separatorPos - 1
			helperExtractPrjCode = Trim(Mid(cellValue, startPos + 1, endPos - startPos))
		Else
			helperExtractPrjCode = cellValue
		End If
	End If
End Function

Sub SetFontColor(cell, transformedValue)
	If helperCheckPrjCode(transformedValue) Then
		cell.Font.Color = &H000000 ' Black
		cell.Interior.Color = &HFFCCCB ' Light red
	Else
		cell.Font.Color = &HFF6400 ' RGB(255, 100, 0)
	End If
End Sub
