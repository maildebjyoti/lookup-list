
'Dummy test functions to call from Workbook
Function SplitAndReturnLengths(cell As Range) As String
    Dim splitValues As Variant
    Dim lengths As String
    Dim i As Long
    
    ' Split the cell value by commas
    splitValues = Split(cell.Value, ",")
    
    ' Initialize the lengths string
    lengths = ""
    
    ' Loop through each split value and calculate its length
    For i = LBound(splitValues) To UBound(splitValues)
        ' Trim whitespace and get length
        lengths = lengths & Len(Trim(splitValues(i))) & ", "
    Next i
    
    ' Remove the trailing comma and space
    If Len(lengths) > 0 Then
        lengths = Left(lengths, Len(lengths) - 2)
    End If
    
    ' Return the lengths as a comma-separated string
    SplitAndReturnLengths = lengths
End Function

Function getCriticality(cell As Range) As String
    Dim wsLookup As Worksheet
    Set wsLookup = ThisWorkbook.Sheets("System Information")
    getCriticality = helperGetCriticality(cell.Value, wsLookup)
End Function

Function getAssetHealth(cell As Range) As String
    Dim wsLookup As Worksheet
    Set wsLookup = ThisWorkbook.Sheets("System Information")
    getAssetHealth = helperGetAssetHealth(cell.Value, wsLookup)
End Function

'Below procedure converts each comma separated systems into individual rows. Source is "DataCopied" sheet and the transformed data is pasted into "TransformedData" sheet
Sub TransformData()
    Dim wsSource As Worksheet
    Dim wsTarget As Worksheet
    Dim lastRow As Long
    Dim i As Long, j As Long
    Dim labels As Variant
    Dim currentRow As Long

    ' Set the source worksheet (where your data is)
    Set wsSource = ThisWorkbook.Sheets("DataCopied") ' Adjust to your source sheet index or name
    
    ' Create or clear the target worksheet
    On Error Resume Next
    Set wsTarget = ThisWorkbook.Sheets("TransformedData")
    On Error GoTo 0
    
    If wsTarget Is Nothing Then
        Set wsTarget = ThisWorkbook.Sheets.Add
        wsTarget.Name = "TransformedData"
    Else
        wsTarget.Cells.Clear ' Clear existing data
    End If

    ' Set the header row in the target sheet - Adjust as needed for other columns
    wsTarget.Range("A1").Value = "Release Type"
    wsTarget.Range("B1").Value = "Year"
    wsTarget.Range("C1").Value = "CO Start Date"
    wsTarget.Range("D1").Value = "Status"
    wsTarget.Range("E1").Value = "RGB"
    wsTarget.Range("F1").Value = "Project Code"
    wsTarget.Range("G1").Value = "Summary"
    wsTarget.Range("H1").Value = "Systems"
    wsTarget.Range("I1").Value = "Criticality"  '=TRIM(IFNA(VLOOKUP(H2, 'System Information'!B:H,3, FALSE), "ERROR"))
    wsTarget.Range("J1").Value = "Asset Health" '=TRIM(IFNA(VLOOKUP(H2, 'System Information'!B:H,2, FALSE), "ERROR"))
    wsTarget.Range("K1").Value = "Department"   '=TRIM(IFNA(VLOOKUP(H2, 'System Information'!B:H,6, FALSE), "ERROR"))
    wsTarget.Range("L1").Value = "Portfolio"    '=TRIM(IFNA(VLOOKUP(H2, 'System Information'!B:H,7, FALSE), "ERROR"))

    ' Find the last row in column A
    lastRow = wsSource.Cells(wsSource.Rows.Count, "A").End(xlUp).Row

    currentRow = 2 ' Start inserting data from row 2

    ' Loop through each row in the source sheet
    For i = 2 To lastRow ' Assuming headers are in row 1
        ' Split the comma-separated values in column H
        labels = Split(wsSource.Cells(i, "H").Value, ",")
        
        ' Loop through each label and create a new row in the target sheet
        For j = LBound(labels) To UBound(labels)
            ' Copy value from Column A - G
            wsTarget.Cells(currentRow, 1).Value = wsSource.Cells(i, 1).Value
            wsTarget.Cells(currentRow, 2).Value = wsSource.Cells(i, 2).Value
            wsTarget.Cells(currentRow, 3).Value = wsSource.Cells(i, 3).Value
            wsTarget.Cells(currentRow, 4).Value = wsSource.Cells(i, 4).Value
            wsTarget.Cells(currentRow, 5).Value = wsSource.Cells(i, 5).Value
            wsTarget.Cells(currentRow, 6).Value = wsSource.Cells(i, 6).Value
            wsTarget.Cells(currentRow, 7).Value = wsSource.Cells(i, 7).Value
            
            wsTarget.Cells(currentRow, 8).Value = Trim(labels(j)) ' Copy label from Column H
            
            wsTarget.Cells(currentRow, 9).Formula = "=TRIM(IFNA(VLOOKUP(H" & currentRow & ", 'System Information'!B:H,3, FALSE), ""ERROR""))"
            wsTarget.Cells(currentRow, 10).Formula = "=TRIM(IFNA(VLOOKUP(H" & currentRow & ", 'System Information'!B:H,2, FALSE), ""ERROR""))"
            wsTarget.Cells(currentRow, 11).Formula = "=TRIM(IFNA(VLOOKUP(H" & currentRow & ", 'System Information'!B:H,6, FALSE), ""ERROR""))"
            wsTarget.Cells(currentRow, 12).Formula = "=TRIM(IFNA(VLOOKUP(H" & currentRow & ", 'System Information'!B:H,7, FALSE), ""ERROR""))"
            
            currentRow = currentRow + 1
        Next j
    Next i

    ' Autofit the columns in the target sheet
    wsTarget.Columns.AutoFit
    
    MsgBox "Data has been transformed successfully!", vbInformation
End Sub


'Transform external sheet

Sub TransExternalSheet()
    Dim wbSource As Workbook
    Dim wbDest As Workbook
    Dim filePath As String

    Dim wbLookup As Workbook
    Dim wsLookup As Worksheet
    Set wbLookup = Workbooks.Open("C:\Users\debjyotiacharjee\OneDrive - The Hong Kong Jockey Club\Download\System information Management.xlsx") '<-- System Information Sheet
    Set wsLookup = wbLookup.Worksheets("System information Management") '<-- Sheet Name
    
    ' Specify the file path of Workbook2.xlsx
    ' Change this to your file path
    'filePath = "C:\Users\debjyotiacharjee\Report.xlsx"
    filePath = "C:\Users\debjyotiacharjee\OneDrive - The Hong Kong Jockey Club\Download\i. RPT - Release Pipeline.xlsx"

    ' Open Workbook2
    On Error Resume Next
    Set wbSource = Workbooks.Open(filePath)
    
    If wbSource Is Nothing Then
        MsgBox "Could not open External File. Please check the file path."
        Exit Sub
    End If

    ' Perform transformations on Workbook2
    With wbSource.Sheets(1) ' Change to the correct sheet if necessary
        
        ' Find the last row in column H - Status - Safest as this will not be empty
        Dim lastRow As Long ' Use Long for row numbers
        lastRow = .Cells(.Rows.Count, "H").End(xlUp).Row
        
        ' If lastRow is less than 1, no data is present in column H
        If lastRow < 1 Then
            MsgBox "No data found in column H."
            wbSource.Close False
            Exit Sub
        End If
    
        Dim i As Long
        Dim cellValue As String
        Dim transformedValue As String
        Dim cellValueLeadPortfolio, cellValuePortfolio As String
        
        ' Set Headers
        .Cells(1, 24).Value = "Systems Involved" 'Systems Involved - Column X/24
        .Cells(1, 25).Value = "Criticality" 'Criticality - Column Y/25
        .Cells(1, 26).Value = "Is Criticality" 'Is Critical - Column Z/26
        .Cells(1, 27).Value = "Asset Health" 'Asset Health - Column AA/27
        .Cells(1, 28).Value = "Is Customer Facing" 'Is Customer Facing - Column AB/28
        .Cells(1, 29).Value = "Is Media Facing" 'Is Media Facing - Column AC/29
        ' Copy formatting from A1
        .Cells(1, 1).Copy
        .Cells(1, 24).PasteSpecial Paste:=xlPasteFormats
        .Cells(1, 25).PasteSpecial Paste:=xlPasteFormats
        .Cells(1, 26).PasteSpecial Paste:=xlPasteFormats
        .Cells(1, 27).PasteSpecial Paste:=xlPasteFormats
        .Cells(1, 28).PasteSpecial Paste:=xlPasteFormats
        .Cells(1, 29).PasteSpecial Paste:=xlPasteFormats
        
            
        For i = 2 To lastRow
        
          'Project Link - Extract Project Code & Set Color - Column G/7
            cellValue = .Cells(i, 7).Value
            transformedValue = helperExtractPrjCode(cellValue)
            .Cells(i, 7).Value = transformedValue
            .Cells(i, 7).Font.Color = RGB(255, 100, 0)
            If helperCheckPrjCode(transformedValue) Then
                .Cells(i, 7).Font.Color = RGB(0, 0, 0)
                .Cells(i, 7).Interior.Color = RGB(255, 204, 204)
            End If
            
            
          'Portfolio - Column C/3
            transformedValue = ""
            cellValueLeadPortfolio = .Cells(i, 2).Value
            cellValuePortfolio = .Cells(i, 3).Value
            If cellValueLeadPortfolio <> Empty Then
                transformedValue = Trim(cellValueLeadPortfolio)
            ElseIf cellValuePortfolio = "<Portfolio Name>" Or cellValuePortfolio = "" Then
                transformedValue = "BLANK-ERROR"
                .Cells(i, 2).Interior.Color = RGB(255, 204, 204)
                .Cells(i, 3).Interior.Color = RGB(255, 204, 204)
            Else
                transformedValue = Trim(cellValuePortfolio)
                .Cells(i, 2).Interior.Color = RGB(204, 255, 153)
            End If
            .Cells(i, 2).Value = transformedValue 'Lead IT Portfolio
            .Cells(i, 3).Value = transformedValue 'Portfolio
            
          'Individual or Major Release - Column D/4
            cellValue = .Cells(i, 4).Value
            If cellValue = "" Then
                .Cells(i, 4).Value = "Individual Release"
                .Cells(i, 4).Interior.Color = RGB(204, 255, 153)
            End If
            
            
          'Systems Involved - Column X/24
            cellValue = .Cells(i, 10).Value
            transformedValue = ""
            transformedValue = helperSplitText(cellValue)
            .Cells(i, 24).Value = transformedValue
            .Cells(i, 24).Font.Name = "Consolas"
            .Cells(i, 24).Font.Size = 9
            .Cells(i, 24).Interior.Color = RGB(255, 204, 204)
            
            
          'Criticality - Column Y/25
            cellValue = .Cells(i, 10).Value
            transformedValue = ""
            transformedValue = helperGetCriticality(cellValue, wsLookup)
            .Cells(i, 25).Value = transformedValue
            .Cells(i, 25).Font.Name = "Consolas"
            .Cells(i, 25).Font.Size = 9
            .Cells(i, 25).Interior.Color = RGB(204, 255, 153)
            If InStr(1, transformedValue, "Error", vbTextCompare) > 0 Then
                .Cells(i, 25).Interior.Color = RGB(255, 204, 204)
            End If
            
    
          'Is Critical - Column Z/26
            transformedValue = helperIsCritical(transformedValue)
            .Cells(i, 26).Value = transformedValue
            If transformedValue Then
                .Cells(i, 26).Interior.Color = RGB(255, 204, 204)
            End If
            
            
          'Asset Health - Column AA/27
            cellValue = .Cells(i, 10).Value
            transformedValue = ""
            transformedValue = helperGetAssetHealth(cellValue, wsLookup)
            .Cells(i, 27).Value = transformedValue
            .Cells(i, 27).Font.Name = "Consolas"
            .Cells(i, 27).Font.Size = 9
            .Cells(i, 27).Interior.Color = RGB(204, 255, 153)
            If InStr(1, transformedValue, "Error", vbTextCompare) > 0 Then
                .Cells(i, 27).Interior.Color = RGB(255, 204, 204)
            End If
            
            
          'Is Customer Facing - Column AB/28
            .Cells(i, 28).Value = helperIsCustomerFacing(transformedValue)
            If .Cells(i, 28).Value Then
                .Cells(i, 28).Interior.Color = RGB(255, 204, 204)
            End If
            
            
          'Is Media Facing - Column AC/29
            .Cells(i, 29).Value = helperIsMediaFacing(transformedValue)
            If .Cells(i, 29).Value Then
                .Cells(i, 29).Interior.Color = RGB(255, 204, 204)
            End If
            
            
        Next i
        
        'Delete & clean-up the "Lead IT Portfolio" column
        '.Columns(2).Delete
        
        'Delete the last 3 rows
        .Rows(lastRow + 1 & ":" & lastRow + 3).Delete
    End With

    ' Save and close Workbook
    wbSource.Save
    wbSource.Close

    ' Clean up
    Set wbSource = Nothing
    Set wbLookup = Nothing
    Set wsLookup = Nothing

    MsgBox "Transformation completed successfully!"
End Sub

Function helperGetCriticality(cellValue As String, wsLookup As Worksheet) As String
    Dim splitValues As Variant
    Dim resultValues As String
    Dim i As Long
    Dim foundCell As Range

    ' Split the cell value by commas
    splitValues = Split(cellValue, ",")

    ' Initialize the result values string
    resultValues = ""

    ' Loop through each split value
    For i = LBound(splitValues) To UBound(splitValues)
        ' Trim whitespace from the current value
        Dim currentValue As String
        currentValue = Trim(splitValues(i))

        ' Check if the current value exists in column B of the lookup sheet
        Set foundCell = wsLookup.Columns("B").Find(currentValue, LookIn:=xlValues, LookAt:=xlWhole)

        If Not foundCell Is Nothing Then
            ' If found, get the corresponding value from column D
            resultValues = resultValues & helperPadWithSpaces(currentValue, 10) & " : " & _
                Trim(wsLookup.Cells(foundCell.Row, "D").Value) & vbCrLf
        Else
            resultValues = resultValues & helperPadWithSpaces("Error", 10) & " : " & currentValue & vbCrLf
        End If
    Next i

    ' Remove the trailing newline
    If Len(resultValues) > 0 Then
        resultValues = Left(resultValues, Len(resultValues) - 2)
    End If

    helperGetCriticality = resultValues
End Function

Function helperGetAssetHealth(cellValue As String, wsLookup As Worksheet) As String
    Dim splitValues As Variant
    Dim resultValues As String
    Dim i As Long
    Dim foundCell As Range

    ' Split the cell value by commas
    splitValues = Split(cellValue, ",")

    ' Initialize the result values string
    resultValues = ""

    ' Loop through each split value
    For i = LBound(splitValues) To UBound(splitValues)
        ' Trim whitespace from the current value
        Dim currentValue As String
        currentValue = Trim(splitValues(i))

        ' Check if the current value exists in column B of the lookup sheet
        Set foundCell = wsLookup.Columns("B").Find(currentValue, LookIn:=xlValues, LookAt:=xlWhole)

        If Not foundCell Is Nothing Then
            ' If found, get the corresponding value from column C
            resultValues = resultValues & helperPadWithSpaces(currentValue, 10) & " : " & _
                Trim(wsLookup.Cells(foundCell.Row, "C").Value) & vbCrLf
        Else
            resultValues = resultValues & helperPadWithSpaces("Error", 10) & " : " & currentValue & vbCrLf
        End If
    Next i

    ' Remove the trailing newline
    If Len(resultValues) > 0 Then
        resultValues = Left(resultValues, Len(resultValues) - 2)
    End If

    helperGetAssetHealth = resultValues
End Function

Function helperPadWithSpaces(str As String, length As Integer) As String
    ' Pad the string with spaces to the specified length
    If Len(str) < length Then
        helperPadWithSpaces = str & Space(length - Len(str))
    Else
        helperPadWithSpaces = Left(str, length) ' Truncate if longer than specified length
    End If
End Function

Function helperSplitText(cellValue As String) As String
    Dim splitValues As Variant
    Dim resultValues As String
    Dim i As Long

    splitValues = Split(cellValue, ",")
    
    ' Initialize the result values string
    resultValues = ""
    
    ' Loop through each split value
    For i = LBound(splitValues) To UBound(splitValues)
        ' Trim whitespace from the current value
        Dim currentValue As String
        currentValue = Trim(splitValues(i))
        resultValues = resultValues & currentValue & ", " & vbCrLf
    Next i
    
    helperSplitText = resultValues
End Function

Function helperCheckPrjCode(inputString As String) As Boolean
    ' Return True if input is empty
    If inputString = "" Then
        helperCheckPrjCode = True
        Exit Function
    End If

    ' Return True if input does not contain "prj"
    If InStr(1, inputString, "prj", vbTextCompare) = 0 Then
        helperCheckPrjCode = True
        Exit Function
    End If
    
    helperCheckPrjCode = (InStr(1, inputString, "prjprj", vbTextCompare) > 0) Or _
                       (InStr(1, inputString, "xxx", vbTextCompare) > 0) Or _
                       (InStr(1, inputString, "tbd", vbTextCompare) > 0)
End Function

Function helperIsCritical(inputString As String) As Boolean
    helperIsCritical = (InStr(1, inputString, "Lifeblood", vbTextCompare) > 0) Or _
                       (InStr(1, inputString, "Critical", vbTextCompare) > 0)
End Function

Function helperIsCustomerFacing(inputString As String) As Boolean
    helperIsCustomerFacing = (InStr(1, inputString, "Customer Facing", vbTextCompare) > 0)
End Function

Function helperIsMediaFacing(inputString As String) As Boolean
    helperIsMediaFacing = (InStr(1, inputString, "Media Facing", vbTextCompare) > 0)
End Function

Function helperExtractPrjCode(cellValue As String) As String
    Dim startPos As Integer
    Dim endPos As Integer
    Dim separatorPos As Integer

    ' Check for the presence of "|"
    separatorPos = InStr(cellValue, "|")
    
    If separatorPos = 0 Then
        ' If "|" is not found, return the original value
        helperExtractPrjCode = cellValue
    Else
        ' Find the position of "["
        startPos = InStr(cellValue, "[")
        
        If startPos > 0 Then
            ' Extract the value between "[" and "|"
            endPos = separatorPos - 1
            helperExtractPrjCode = Trim(Mid(cellValue, startPos + 1, endPos - startPos))
        Else
            ' If "[" is not found, return the original value
            helperExtractPrjCode = cellValue
        End If
    End If
End Function


'----------------------------------------------------------------------------------
Sub SendEmailReportWithChart()
    Dim OutlookApp As Object
    Dim OutlookMail As Object
    Dim EmailBody As String
    Dim EmailTo As String
    Dim EmailSubject As String
    Dim rng As Range
    Dim ChartObject As ChartObject
    Dim ChartImagePath As String

    ' Set the range to include in the email body (change as needed)
    Set rng = ThisWorkbook.Sheets("Sheet1").Range("B1:G30") ' Adjust the range

    ' Prepare the email content
    EmailTo = "debjyoti.acharjee@hkjc.org.hk" ' Change to the recipient's email address
    EmailSubject = "Monthly Report with Chart"
    EmailBody = "Hello," & vbCrLf & vbCrLf & _
                "Please find the report below:" & vbCrLf & vbCrLf & _
                RangeToText(rng) & vbCrLf & vbCrLf & _
                "Best regards," & vbCrLf & _
                "RGB Reports" ' Customize as needed

'    ' Create Chart Image
'    Set ChartObject = ThisWorkbook.Sheets("Sheet1").ChartObjects(1) ' Adjust index or name as needed
'    ChartImagePath = ThisWorkbook.Path & "\ChartImage.png" ' Path to save the chart image
'
'    ' Export the chart as an image
'    ChartObject.Chart.Export Filename:=ChartImagePath, FilterName:="PNG"

    ' Create Outlook application and email object
    Set OutlookApp = CreateObject("Outlook.Application")
    Set OutlookMail = OutlookApp.CreateItem(0) ' 0 for mail item

    ' Set email properties
    With OutlookMail
        .To = EmailTo
        .Subject = EmailSubject
        .Body = EmailBody
        '.Attachments.Add ChartImagePath ' Attach the chart image
        .Display ' Use .Send to send directly without displaying
    End With

    ' Clean up
    Set OutlookMail = Nothing
    Set OutlookApp = Nothing

'    ' Delete the chart image file after sending (optional)
'    On Error Resume Next
'    Kill ChartImagePath
'    On Error GoTo 0
End Sub

Function RangeToText(rng As Range) As String
    Dim cell As Range
    Dim reportText As String
    
    ' Convert the range to text format
    reportText = ""
    For Each cell In rng
        reportText = reportText & cell.Value & vbTab ' Use tab for spacing
        If cell.Column = rng.Columns.Count Then
            reportText = reportText & vbCrLf ' New line at the end of each row
        End If
    Next cell
    
    RangeToText = reportText
End Function

Sub SendEmailReportWithHTML()
    Dim OutlookApp As Object
    Dim OutlookMail As Object
    Dim EmailBody As String
    Dim EmailTo As String
    Dim EmailSubject As String
    Dim rng As Range
    Dim ChartObject As ChartObject
    Dim ChartImagePath As String

    ' Set the range to include in the email body (B1:G30)
    Set rng = ThisWorkbook.Sheets("Sheet1").Range("B1:G30") ' Adjusted range

    ' Prepare the email content
    EmailTo = "debjyoti.acharjee@hkjc.org.hk" ' Change to the recipient's email address
    EmailSubject = "Monthly Report with Chart"
    
    ' Convert the range to HTML
    EmailBody = "<html><body>"
    EmailBody = EmailBody & "<p>Hello,</p>"
    EmailBody = EmailBody & "<p>Please find the report below:</p>"
    EmailBody = EmailBody & RangeToHTML(rng)
    EmailBody = EmailBody & "<p>Best regards,<br>Your Name</p>"
    EmailBody = EmailBody & "</body></html>"

    ' Create Outlook application and email object
    Set OutlookApp = CreateObject("Outlook.Application")
    Set OutlookMail = OutlookApp.CreateItem(0) ' 0 for mail item

    ' Set email properties
    With OutlookMail
        .To = EmailTo
        .Subject = EmailSubject
        .HTMLBody = EmailBody ' Set the HTML body
        .Display ' Use .Send to send directly without displaying
    End With

    ' Clean up
    Set OutlookMail = Nothing
    Set OutlookApp = Nothing
End Sub

Function RangeToHTML(rng As Range) As String
    Dim fCell As Range
    Dim html As String
    Dim rowCount As Long
    Dim colCount As Long
    Dim r As Long
    Dim c As Long
    
    rowCount = rng.Rows.Count
    colCount = rng.Columns.Count

    ' Start the HTML table
    html = "<table border='1' style='border-collapse:collapse;'>"
    
    ' Loop through each row and column
    For r = 1 To rowCount
        html = html & "<tr>"
        For c = 1 To colCount
            Set fCell = rng.Cells(r, c)
            html = html & "<td style='padding:5px;'>" & fCell.Value & "</td>"
        Next c
        html = html & "</tr>"
    Next r
    
    ' End the HTML table
    html = html & "</table>"
    
    RangeToHTML = html
End Function

