import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { textSchema } from '../../schemas/text/schema';

const Footer: React.FC = () => {
  const text = textSchema.en.common;

  return (
    <footer 
      style={{ 
        backgroundColor: 'var(--bg-light)', 
        color: 'var(--gray-dark)', 
        marginTop: 'auto' 
      }} 
      className="py-3 border-top"
    >
      <Container>
        <Row>
          <Col className="text-center">
            <span style={{ fontSize: 'var(--font-sm)' }}>{text.footerRights}</span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;