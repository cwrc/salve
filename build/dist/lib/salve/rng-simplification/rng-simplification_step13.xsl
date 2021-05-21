<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.1" xmlns="http://relaxng.org/ns/structure/1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:rng="http://relaxng.org/ns/structure/1.0" exclude-result-prefixes="rng">

<xsl:output method="xml"/>

<!-- 7.16
zeroOrMore patterns are transformed into choice patterns between a oneOrMore pattern including their unique child pattern and an empty pattern.
 -->

<xsl:template match="*|text()|@*">
	<xsl:copy>
		<xsl:apply-templates select="@*"/>
		<xsl:apply-templates/>
	</xsl:copy>
</xsl:template>

<xsl:template match="rng:zeroOrMore">
	<choice>
		<oneOrMore>
			<xsl:apply-templates/>
		</oneOrMore>
		<empty/>
	</choice>
</xsl:template>

</xsl:stylesheet>
