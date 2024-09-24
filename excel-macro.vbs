' Date: 24-Sep-2024
' Some useful Formulas & Handy Macro Examples
'
'


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
    Dim splitValues As Variant
    Dim resultValues As String
    Dim i As Long
    Dim wsLookup As Worksheet
    Dim foundCell As Range
    
    ' Set the worksheet to look up values
    Set wsLookup = ThisWorkbook.Sheets("System Information")
    
    ' Split the cell value by commas
    splitValues = Split(cell.Value, ",")
    
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
            resultValues = resultValues & HelperPadWithSpaces(currentValue, 10) & " : " & _
                Trim(wsLookup.Cells(foundCell.Row, "D").Value) & vbCrLf ' & ", "
        Else
            resultValues = resultValues & HelperPadWithSpaces("Error", 10) & " : " & currentValue & vbCrLf ' & ", "
        End If
    Next i
    
    ' Remove the trailing comma and space
    If Len(resultValues) > 0 Then
        resultValues = Left(resultValues, Len(resultValues) - 2)
    End If
    
    ' Return the result values as a comma-separated string
    getCriticality = resultValues
End Function

Function getAssetHealth(cell As Range) As String
    Dim splitValues As Variant
    Dim resultValues As String
    Dim i As Long
    Dim wsLookup As Worksheet
    Dim foundCell As Range
    
    ' Set the worksheet to look up values
    Set wsLookup = ThisWorkbook.Sheets("System Information")
    
    ' Split the cell value by commas
    splitValues = Split(cell.Value, ",")
    
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
            resultValues = resultValues & HelperPadWithSpaces(currentValue, 10) & " : " & _
                Trim(wsLookup.Cells(foundCell.Row, "C").Value) & vbCrLf
        Else
            ' Handle error condition
            resultValues = resultValues & HelperPadWithSpaces("Error", 10) & " : " & currentValue & vbCrLf ' & ", "
        End If
    Next i
    
    ' Return the result values as a string (no need to remove trailing comma)
    getAssetHealth = resultValues
End Function

Function HelperPadWithSpaces(str As String, length As Integer) As String
    ' Pad the string with spaces to the specified length
    If Len(str) < length Then
        HelperPadWithSpaces = str & Space(length - Len(str))
    Else
        HelperPadWithSpaces = Left(str, length) ' Truncate if longer than specified length
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
