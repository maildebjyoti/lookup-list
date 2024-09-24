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
